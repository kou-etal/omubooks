<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Pusher\Pusher;
use App\Http\Controllers\PusherAuthController;

Route::post('/my-broadcast-auth', [PusherAuthController::class, 'authenticate'])
    ->middleware(['web', 'auth:sanctum']);


require __DIR__.'/auth.php';

/*Route::post('/my-broadcast-auth', function (Request $request) {
    return response()->json(['user' => $request->user()?->id]);
})->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
  ->middleware(['web', 'auth:sanctum']);*/

/*Route::post('/my-broadcast-auth', function (Request $request) {

    \Log::info('AUTH HIT', [
        'user' => $request->user()?->id,
        '_token' => $request->_token,
        'headers' => $request->headers->all()
    ]);
});*/



/*Route::post('/my-broadcast-auth', function (Request $request) {
    // 1. ログインユーザー取得
    $user = $request->user();
    if (!$user) {
        return response()->json(['error' => 'Unauthenticated'], 403);
    }

    // 2. チャンネル名とソケットID取得
    $channelName = $request->input('channel_name'); // 例: private-chat.3
    $socketId = $request->input('socket_id');

    // 3. チャンネル名から userId を抽出
    if (!preg_match('/^private-chat\.(\d+)$/', $channelName, $matches)) {
        return response()->json(['error' => 'Invalid channel format'], 403);
    }

    $targetUserId = (int) $matches[1];

    // 4. 現在のログインユーザーと一致しているか確認
    if ($user->id !== $targetUserId) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    // 5. Pusher 署名生成して返す
    $pusher = new Pusher(
        env('PUSHER_APP_KEY'),
        env('PUSHER_APP_SECRET'),
        env('PUSHER_APP_ID'),
        [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'useTLS' => false
        ]
    );

    $authResponse = $pusher->socket_auth($channelName, $socketId);

    return response()->json(json_decode($authResponse, true));
})->middleware('web');*/
