<?php

namespace App\Http\Controllers;

use App\Http\Requests\Reviews\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\Trade;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class ReviewsController extends Controller
{
    /** 公開済みレビュー一覧（プロフィール用） */
    public function index(User $user)
    {
        $reviews = Review::with(['rater:id,name'])
            ->where('ratee_id', $user->id)
            ->where('is_public', true) // ← 公開済みのみ
            ->latest()
            ->paginate(request('per_page', 20));

        return ReviewResource::collection($reviews);
    }

    /**
     * 作成：当事者のみ / 取引completedのみ / 同一raterは1件まで
     * 公開は「相互に投稿が揃った時」に両方is_public=trueにする
     */
 

public function store(StoreReviewRequest $request, Trade $trade)
    {
        $me = $request->user(); // = Auth::user()

        // 1) 当事者チェック
        if ($trade->buyer_id !== $me->id && $trade->seller_id !== $me->id) {
            abort(403, 'この取引のレビュー権限がありません');
        }

        // 2) 完了済みのみ（双方完了 → status=completed）
        if ($trade->status !== 'completed') {
            return response()->json(['message' => '取引完了後にレビューできます'], 400);
        }

        // 3) ここが抜けていた：評価者/被評価者を決める
        $raterId = $me->id;
        $rateeId = $trade->buyer_id === $me->id ? $trade->seller_id : $trade->buyer_id;

        // 4) 事前ガード（二重投稿）
        $exists = Review::where('trade_id', $trade->id)->where('rater_id', $raterId)->exists();
        if ($exists) {
            return response()->json(['message' => 'この取引へのレビューは既に投稿済みです'], 409);
        }

        $v = $request->validated();

        try {
            return DB::transaction(function () use ($trade, $raterId, $rateeId, $v) {
                // 5) まず自分のレビューを作成（is_public は相互投稿が揃ったら true）
                $review = Review::create([
                    'trade_id'  => $trade->id,
                    'rater_id'  => $raterId,
                    'ratee_id'  => $rateeId,
                    'score'     => $v['score'],
                    'comment'   => $v['comment'] ?? null,
                    'is_public' => false, // ← reviews に is_public が無いならこの行は削除
                ])->load(['rater:id,name', 'ratee:id,name']);

                // 6) 相手側のレビューが既にあるか
                $counter = Review::where('trade_id', $trade->id)
                    ->where('rater_id', $rateeId) // 相手が投稿しているか
                    ->first();

                if ($counter) {
                    // 相互に揃ったので両方公開
                    Review::whereKey([$review->id, $counter->id])
                        ->update(['is_public' => true]);

                    // 公開済みだけで平均再計算（is_public を使わないなら recalc を通常に）
                    $this->recalculateRatingPublicOnly($review->ratee_id);
                    $this->recalculateRatingPublicOnly($counter->ratee_id);

                    $review->is_public = true; // レスポンスの見た目合わせ
                }

                return (new ReviewResource($review))
                    ->additional(['message' => $review->is_public
                        ? 'レビューを投稿し、公開されました。'
                        : 'レビューを投稿しました（相手のレビュー投稿後に公開されます）。'
                    ]);
            });
        } catch (QueryException $e) {
            // DBユニーク制約（(trade_id, rater_id)）での衝突を409に
            if ((string)$e->getCode() === '23000') {
                return response()->json(['message' => 'この取引へのレビューは既に投稿済みです'], 409);
            }
            throw $e;
        }
    }
    /** 公開済みレビューのみで rating_avg を再計算 */
    protected function recalculateRatingPublicOnly(int $userId): void
    {
        $agg = Review::where('ratee_id', $userId)
            ->where('is_public', true)
            ->selectRaw('COUNT(*) as cnt, AVG(score) as avg')
            ->first();

        User::whereKey($userId)->update([
            'rating_avg' => $agg->cnt ? round((float) $agg->avg, 1) : 0,
        ]);
    }
}
