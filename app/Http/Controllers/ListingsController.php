<?php

namespace App\Http\Controllers;

use App\Http\Requests\Listings\StoreListingRequest;
use App\Http\Requests\Listings\UpdateListingRequest;
use App\Http\Requests\Listings\SearchListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use App\Models\ListingImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ListingsController extends Controller
{
    /** 一覧（公開中のみ）+ 検索 + ページネーション */
    public function index(SearchListingRequest $request)
    {
        $q = $request->validated()['q'] ?? null;

        $list = Listing::query()
            ->with(['user:id,name,rating_avg,deals_count', 'images'])
            ->active()
            ->when($q, fn ($qq) => $qq->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('course_name', 'like', "%{$q}%");
            }))
            ->latest()
            ->paginate($request->validated()['per_page'] ?? 20);

        return ListingResource::collection($list);
    }

    /** 詳細 */
    public function show(Listing $listing)
    {
        // 非公開/下書きはオーナーのみ閲覧可
        if (!in_array($listing->status, ['active','sold']) && $listing->user_id !== Auth::id()) {
            abort(403);
        }

        $listing->load(['user:id,name,rating_avg,deals_count', 'images']);
        return new ListingResource($listing);
    }

    /** 作成（画像最大3枚） */
    public function store(StoreListingRequest $request)
    {
        $v = $request->validated();

        return DB::transaction(function () use ($v, $request) {
            $listing = Listing::create([
                'user_id'     => Auth::id(),
                'title'       => $v['title'],
                'course_name' => $v['course_name'],
                'price'       => $v['price'],
                'description' => $v['description'] ?? null,
                'status'      => 'active',
            ]);

            $this->storeImages($request, $listing);
            $listing->load(['user:id,name,rating_avg,deals_count', 'images']);

            return (new ListingResource($listing))
                ->additional(['message' => '出品を作成しました。']);
        });
    }

    /** 更新（オーナーのみ） */
    public function update(UpdateListingRequest $request, Listing $listing)
    {
        $this->authorizeOwner($listing);

        $v = $request->validated();

        return DB::transaction(function () use ($v, $request, $listing) {
            $listing->fill([
                'title'       => $v['title']       ?? $listing->title,
                'course_name' => $v['course_name'] ?? $listing->course_name,
                'price'       => $v['price']       ?? $listing->price,
                'description' => $v['description'] ?? $listing->description,
                'status'      => $v['status']      ?? $listing->status,
            ])->save();

            // 画像差し替え（任意）：既存削除 → 新規保存
            if ($request->hasFile('images')) {
                $this->deleteImages($listing);
                $this->storeImages($request, $listing);
            }

            $listing->load(['user:id,name,rating_avg,deals_count', 'images']);
            return (new ListingResource($listing))
                ->additional(['message' => '出品を更新しました。']);
        });
    }

    /** 非公開化 or 論理削除（MVPは非公開推奨） */
    public function destroy(Listing $listing)
    {
        $this->authorizeOwner($listing);

        // 非公開運用（hiddenへ）でもOK。ここではソフトデリート。
        $this->deleteImages($listing);
        $listing->delete();

        return response()->json(['message' => '出品を削除しました。']);
    }

    /** サジェスト（簡易）：タイトル/講義名の候補返却 */
    public function suggest(SearchListingRequest $request)
    {
        $q = $request->validated()['q'] ?? '';
        if (mb_strlen($q) < 2) {
            return response()->json(['books' => [], 'courses' => []]);
        }

        $books = Listing::active()
            ->select('title')
            ->where('title', 'like', "%{$q}%")
            ->distinct()->limit(8)->pluck('title');

        $courses = Listing::active()
            ->select('course_name')
            ->where('course_name', 'like', "%{$q}%")
            ->distinct()->limit(8)->pluck('course_name');

        return response()->json([
            'books'   => $books,
            'courses' => $courses,
        ]);
    }

    /** ユーティリティ：画像保存(最大3枚) */
    protected function storeImages(Request $request, Listing $listing): void
    {
        if (!$request->hasFile('images')) return;

        $files = $request->file('images');
        $max = min(count($files), 3);

        for ($i = 0; $i < $max; $i++) {
            $path = $files[$i]->store('listing_images', 'public');
            ListingImage::create([
                'listing_id' => $listing->id,
                'path'       => config('app.url') . '/storage/' . $path,
            ]);
        }
    }

    /** ユーティリティ：画像削除 */
    protected function deleteImages(Listing $listing): void
    {
        foreach ($listing->images as $img) {
            // ストレージからも削除（失敗は握りつぶす）
            if ($img->path && str_starts_with($img->path, config('app.url') . '/storage/')) {
                $rel = str_replace(config('app.url') . '/storage/', '', $img->path);
                @Storage::disk('public')->delete($rel);
            }
            $img->delete();
        }
    }

    /** オーナー確認 */
    protected function authorizeOwner(Listing $listing): void
    {
        if ($listing->user_id !== Auth::id()) {
            abort(403, 'この出品を操作する権限がありません。');
        }
    }
}
