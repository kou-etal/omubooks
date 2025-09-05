<?php

namespace App\Http\Controllers;

use App\Http\Requests\Reviews\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\Trade;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReviewsController extends Controller
{
    /** 受けたレビュー一覧 */
    public function index(User $user)
    {
        $reviews = Review::with(['rater:id,name'])
            ->where('ratee_id', $user->id)
            ->latest()
            ->paginate(request('per_page', 20));

        return ReviewResource::collection($reviews);
    }

    /** 作成：当事者のみ / 取引completedのみ / 同一raterは1件まで */
    public function store(StoreReviewRequest $request, Trade $trade)
    {
        $me = Auth::user();

        // 当事者チェック
        if ($trade->buyer_id !== $me->id && $trade->seller_id !== $me->id) {
            abort(403, 'この取引のレビュー権限がありません');
        }

        // 完了済み取引のみ
        if ($trade->status !== 'completed') {
            return response()->json(['message' => '取引完了後にレビューできます'], 400);
        }

        // 自分が評価する相手を決定
        $raterId = $me->id;
        $rateeId = $trade->buyer_id === $me->id ? $trade->seller_id : $trade->buyer_id;

        // 二重投稿防止
        $exists = Review::where('trade_id', $trade->id)
            ->where('rater_id', $raterId)
            ->exists();
        if ($exists) {
            return response()->json(['message' => 'この取引へのレビューは既に投稿済みです'], 409);
        }

        $v = $request->validated();

        return DB::transaction(function () use ($trade, $raterId, $rateeId, $v) {
            $review = Review::create([
                'trade_id' => $trade->id,
                'rater_id' => $raterId,
                'ratee_id' => $rateeId,
                'score'    => $v['score'],
                'comment'  => $v['comment'] ?? null,
            ])->load(['rater:id,name', 'ratee:id,name']);

            // rating_avg 再計算
            $this->recalculateRating($rateeId);

            return (new ReviewResource($review))
                ->additional(['message' => 'レビューを投稿しました。']);
        });
    }

    /** ユーティリティ：rating_avgを再計算して保存 */
    protected function recalculateRating(int $userId): void
    {
        $agg = Review::where('ratee_id', $userId)
            ->selectRaw('COUNT(*) as cnt, AVG(score) as avg')
            ->first();

        \App\Models\User::whereKey($userId)->update([
            'rating_avg' => $agg->cnt ? round($agg->avg, 1) : 0,
        ]);
    }
}
