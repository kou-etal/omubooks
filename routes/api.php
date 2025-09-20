<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

use App\Http\Controllers\ProfileApiController;

use App\Http\Controllers\RegisterApiController;

use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\PusherAuthController;

use App\Http\Controllers\VerifyEmailController;
use App\Http\Controllers\NotificationController;



use App\Http\Controllers\ListingsController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\TradesPaymentsController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\TradesController;
use App\Http\Controllers\AdminController;


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/trades/{trade}/messages/remind-platform-fee', [MessagesController::class, 'sendPlatformFeeReminder']);
    Route::post('/trades/{trade}/messages/seller-charge-template', [MessagesController::class, 'sendSellerChargeTemplate']);
});

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('trades', [TradesController::class, 'index']);
    Route::get('trades/{trade}', [TradesController::class, 'show']);
    Route::post('trades', [TradesController::class, 'store']);
    Route::post('trades/{trade}/scheduled', [TradesController::class, 'markScheduled']);
    // 自分側の完了フラグを立てる
    Route::post('trades/{trade}/complete', [TradesController::class, 'completeByMe']);
});

Route::get('/session', [SessionController::class, 'show']);

Route::middleware('auth')->group(function () {
    // 入金確認フラグ
    Route::post('/trades/{trade}/pay/platform', [TradesPaymentsController::class, 'markPlatformPaid']);
    Route::post('/trades/{trade}/pay/seller',   [TradesPaymentsController::class, 'markSellerPaid']);
});


Route::middleware('auth')->group(function () {
    // 受けたレビュー一覧（公開APIでもOKにしたいならauth外へ）
    Route::get('/users/{user}/reviews', [ReviewsController::class, 'index']);

    // 作成（当事者＆completed限定）
    Route::post('/trades/{trade}/reviews', [ReviewsController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    // 取引ごとのDM
    Route::get('/trades/{trade}/messages',          [MessagesController::class, 'index']);
    Route::post('/trades/{trade}/messages',         [MessagesController::class, 'store']);

    // テンプレ送信（任意機能）
    Route::post('/trades/{trade}/messages/platform-fee-reminder',
        [MessagesController::class, 'sendPlatformFeeReminder']); // 運営8%リマインド

    Route::post('/trades/{trade}/messages/seller-charge',
        [MessagesController::class, 'sendSellerChargeTemplate']); // 出品者92%請求テンプレ
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get   ('me/notifications',        [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::patch ('me/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead']);
    Route::post  ('me/notifications/read-all',  [\App\Http\Controllers\NotificationController::class, 'markAllRead']);
});

 Route::get('/listings',           [ListingsController::class, 'index']);
    Route::get('/listings/suggest',   [ListingsController::class, 'suggest']);
    Route::get('/listings/{listing}', [ListingsController::class, 'show']);
Route::middleware('auth')->group(function () {
   
   Route::get('/my/listings', [ListingsController::class, 'myIndex']);
    Route::post('/listings',          [ListingsController::class, 'store']);
    Route::patch('/listings/{listing}', [ListingsController::class, 'update']);
    Route::delete('/listings/{listing}',[ListingsController::class, 'destroy']);
});



Route::middleware('auth')->group(function () {
    Route::get('/me',            [ProfileApiController::class, 'showMe']);
    Route::get('/me/edit',       [ProfileApiController::class, 'edit']);
    Route::patch('/me',          [ProfileApiController::class, 'update']);
    Route::post('/me/avatar',    [ProfileApiController::class, 'uploadImage']);
});



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum']);
Route::get('/followings/users', [FollowController::class, 'followingsUsers'])->middleware('auth:sanctum');

Route::post('/register',[RegisterApiController::class, 'register']);

Route::get('/products', [ProductApiController::class, 'index']);

Route::get('/products/{id}', [ProductApiController::class, 'show']);



Route::post('/purchase', [PurchaseApiController::class, 'purchase'])->middleware('auth:sanctum');

Route::get('/cart', [CartApiController::class, 'show'])->middleware('auth:sanctum');
Route::post('/cart/add/{id}', [CartApiController::class, 'add'])->middleware(['auth:sanctum','verified']);
Route::post('/cart/remove/{id}', [CartApiController::class, 'remove'])->name('cart.remove');
Route::post('/cart/clear', [CartApiController::class, 'clear'])->name('cart.clear');

Route::middleware(['auth:sanctum',AdminMiddleware::class])->group(function () {
    Route::get('/admin/users', [ProfileApiController::class, 'index']);
    Route::post('/admin/notifications/broadcast', [AdminController::class, 'broadcast']);
    /*Route::get('/admin/products/create', [ProductController::class, 'adminCreate'])->name('admin.products.create');
    Route::post('/admin/products', [ProductController::class, 'adminStore'])->name('admin.products.store');
    Route::get('/admin/products/{id}/edit', [ProductController::class, 'adminEdit'])->name('admin.products.edit');
    Route::post('/admin/products/{id}', [ProductController::class, 'adminUpdate'])->name('admin.products.update');
    Route::delete('/admin/products/{id}', [ProductController::class, 'adminDestroy'])->name('admin.products.destroy');*/
});
Route::middleware('auth:sanctum')->get('/users',[ProfileApiController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/follow/{userId}', [FollowController::class, 'follow']);
    Route::delete('/unfollow/{userId}', [FollowController::class, 'unfollow']);
    Route::get('/follow-status/{userId}', [FollowController::class, 'isFollowing']);
    Route::get('/followings', [FollowController::class, 'index']);
});






Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileApiController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileApiController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileApiController::class, 'destroy'])->name('profile.destroy');
});

Route::post('/send-message', [ChatController::class, 'sendMessage']);
Route::middleware('auth:sanctum')->post('/send-private-message', [PrivateChatController::class, 'send']);
Route::get('/me', function () {
    return response()->json([
        'auth' => Auth::check(),
        'user' => Auth::user(),
    ]);
});

Route::middleware('auth:sanctum')->get('/messages/{targetUserId}', [MessageController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileApiController::class, 'show']);
    Route::post('/profile', [ProfileApiController::class, 'updateIntroduction']);
    Route::post('/profile-image', [ProfileApiController::class, 'uploadImage']);
});

Route::get('/posts', [PostApiController::class, 'index']);
Route::middleware('auth:sanctum')->get('/posts/following', [PostApiController::class, 'following']);
Route::middleware('auth:sanctum')->post('/posts', [PostApiController::class, 'store']);
Route::middleware('auth:sanctum')->post('/posts/{post}/like', [PostApiController::class, 'like']);

Route::get('/email/verify/{id}/{hash}',VerifyEmailController::class)
    ->middleware(['throttle:6,1'])
    ->name('verification.verify');

//Route::post('/my-broadcast-auth', [PusherAuthController::class, 'authenticate']);
    //->middleware(['auth:sanctum']);

Route::middleware('auth:sanctum')->post('/groups', [GroupApiController::class, 'store']);
Route::middleware('auth:sanctum')->post('/groups/{group}/add-user', [GroupApiController::class, 'addUser']);
Route::middleware('auth:sanctum')->post('/group-messages/send', [GroupChatController::class, 'send']);
Route::middleware('auth:sanctum')->get('/group-messages/{group}', [GroupChatController::class, 'history']);
Route::middleware('auth:sanctum')->get('/my-groups', [GroupApiController::class, 'myGroups']);

