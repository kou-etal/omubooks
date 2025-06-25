<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\ProductApiController;
use App\Http\Controllers\ProfileApiController;
use App\Http\Controllers\CartApiController;
use App\Http\Controllers\PurchaseApiController;
use App\Http\Controllers\RegisterApiController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\GroupApiController;
use App\Http\Controllers\GroupChatController;
use App\Http\Controllers\PrivateChatController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\PusherAuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\PostApiController;
use App\Http\Controllers\VerifyEmailController;





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

Route::middleware('auth:sanctum')->get('/posts', [PostApiController::class, 'index']);
Route::middleware('auth:sanctum')->get('/posts/following', [PostApiController::class, 'following']);
Route::middleware('auth:sanctum')->post('/posts', [PostApiController::class, 'store']);
Route::middleware('auth:sanctum')->post('/posts/{post}/like', [PostApiController::class, 'like']);

Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->middleware([/*'signed',*/ 'throttle:6,1'])
    ->name('verification.verify');

//Route::post('/my-broadcast-auth', [PusherAuthController::class, 'authenticate']);
    //->middleware(['auth:sanctum']);

Route::middleware('auth:sanctum')->post('/groups', [GroupApiController::class, 'store']);
Route::middleware('auth:sanctum')->post('/groups/{group}/add-user', [GroupApiController::class, 'addUser']);
Route::middleware('auth:sanctum')->post('/group-messages/send', [GroupChatController::class, 'send']);
Route::middleware('auth:sanctum')->get('/group-messages/{group}', [GroupChatController::class, 'history']);
Route::middleware('auth:sanctum')->get('/my-groups', [GroupApiController::class, 'myGroups']);

