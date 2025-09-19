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

use App\Http\Requests\Listings\MyListingsRequest;



class ListingsController extends Controller
{
    /** 一覧（公開中のみ）+ 検索 + タグ絞り込み + ページネーション */
    public function index(SearchListingRequest $request)
    {
        $v = $request->validated();
        $q = $v['q'] ?? null;

        $list = Listing::query()
            ->with(['user:id,name,rating_avg,deals_count', 'images'])
            ->where('status', 'active')
            ->when($q, fn ($qq) => $qq->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('course_name', 'like', "%{$q}%");
            }))
            // ▼ タグ絞り込み（パラメータが送られてきた時だけ絞る）
            ->when(!empty($v['tag_subject']), fn($qq) => $qq->where('tag_subject', $v['tag_subject']))
            ->when(!empty($v['tag_field']),   fn($qq) => $qq->where('tag_field',   $v['tag_field']))
            ->when(!empty($v['tag_faculty']), fn($qq) => $qq->where('tag_faculty', $v['tag_faculty']))
            ->when(array_key_exists('has_writing', $v), fn($qq) => $qq->where('has_writing', (bool)$v['has_writing']))
            ->latest()
            ->paginate($v['per_page'] ?? 20);

        return ListingResource::collection($list);
    }
    public function myIndex(MyListingsRequest $request)
{
    $v = $request->validated();
    $uid = auth()->id();
    $q = $v['q'] ?? null;
    $status = $v['status'] ?? 'all';

    $list = Listing::query()
        ->with(['images'])
        ->where('user_id', $uid)
        // ステータス指定（all のとき無条件）
        ->when($status !== 'all', fn($qq) => $qq->where('status', $status))
        // キーワード
        ->when($q, fn ($qq) => $qq->where(function ($w) use ($q) {
            $w->where('title', 'like', "%{$q}%")
              ->orWhere('course_name', 'like', "%{$q}%");
        }))
        // （任意）タグ絞り込みを有効にする場合
        ->when(!empty($v['tag_subject']), fn($qq) => $qq->where('tag_subject', $v['tag_subject']))
        ->when(!empty($v['tag_field']),   fn($qq) => $qq->where('tag_field',   $v['tag_field']))
        ->when(!empty($v['tag_faculty']), fn($qq) => $qq->where('tag_faculty', $v['tag_faculty']))
        ->when(array_key_exists('has_writing', $v), fn($qq) => $qq->where('has_writing', (bool)$v['has_writing']))
        ->latest()
        ->paginate($v['per_page'] ?? 20);

    // 自分のページでは seller 情報は不要なので images のみ
    return \App\Http\Resources\ListingResource::collection($list);
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

    /** 作成（画像最大3枚・タグ保存） */
    
    public function store(StoreListingRequest $request)
{
    $v = $request->validated();

    return DB::transaction(function () use ($v, $request) {
        // 受け取りが無ければ active （従来通り）
        $status = $v['status'] ?? 'active';

        $listing = Listing::create([
            'user_id'     => Auth::id(),
            'title'       => $v['title'],
            'course_name' => $v['course_name'],
            'price'       => $v['price'],
            'description' => $v['description'] ?? null,
            'status'      => $status,
            // ▼ タグ
            'tag_subject' => $v['tag_subject'] ?? 'none',
            'tag_field'   => $v['tag_field']   ?? 'none',
            'tag_faculty' => $v['tag_faculty'] ?? 'none',
            'has_writing' => (bool)($v['has_writing'] ?? false),
        ]);

        $this->storeImages($request, $listing);

        $listing->load(['user:id,name,rating_avg,deals_count', 'images']);

        return (new ListingResource($listing))
            ->additional(['message' => $status === 'draft' ? '下書きとして保存しました。' : '出品を作成しました。']);
    });
}

    /** 更新（オーナーのみ・タグも更新可） */
   public function update(UpdateListingRequest $request, Listing $listing)
{
    $this->authorizeOwner($listing);
    $v = $request->validated();

    // ★ 売却済みはステータス変更不可（改ざん対策）
    if ($listing->status === 'sold' && isset($v['status']) && $v['status'] !== 'sold') {
        return response()->json([
            'message' => '売却済みの出品はステータスを変更できません。'
        ], 422);
    }

    return DB::transaction(function () use ($v, $request, $listing) {
        $listing->fill([
            'title'       => $v['title']       ?? $listing->title,
            'course_name' => $v['course_name'] ?? $listing->course_name,
            'price'       => $v['price']       ?? $listing->price,
            'description' => $v['description'] ?? $listing->description,
            // ★ sold のときは常に sold を保持。それ以外のときのみ更新可
            'status'      => $listing->status === 'sold'
                                ? 'sold'
                                : ($v['status'] ?? $listing->status),

            'tag_subject' => $v['tag_subject'] ?? $listing->tag_subject,
            'tag_field'   => $v['tag_field']   ?? $listing->tag_field,
            'tag_faculty' => $v['tag_faculty'] ?? $listing->tag_faculty,
        ]);

        if (array_key_exists('has_writing', $v)) {
            $listing->has_writing = (bool)$v['has_writing'];
        }

        $listing->save();

        if ($request->hasFile('images')) {
            $this->deleteImages($listing);
            $this->storeImages($request, $listing);
        }

        $listing->load(['user:id,name,rating_avg,deals_count', 'images']);
        return (new \App\Http\Resources\ListingResource($listing))
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

        $books = Listing::where('status', 'active')
            ->select('title')
            ->where('title', 'like', "%{$q}%")
            ->distinct()->limit(8)->pluck('title');

        $courses = Listing::where('status', 'active')
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
