<?php
// app/Http/Controllers/AdminController.php
namespace App\Http\Controllers;

use App\Http\Requests\Admin\AdminBroadcastRequest;
use App\Models\User;
use App\Notifications\AdminBroadcast;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;


class AdminController extends Controller
{
    
    /**
     * POST /api/admin/notifications/broadcast
     * body: { title: string, body?: string, action_url?: string, meta?: object }
     */
    public function broadcast(AdminBroadcastRequest $request): JsonResponse
    {
        $p = $request->validated();

        $title     = $p['title'];
        $body      = $p['body']        ?? null;
        $actionUrl = $p['action_url']  ?? null;
        $meta      = is_array($p['meta'] ?? null) ? $p['meta'] : [];

        $sent = 0;

        $users = User::query()
            ->select('id')
            // ★ users に deleted_at が存在する場合のみ、論理削除を除外
            ->when(
                Schema::hasColumn((new User)->getTable(), 'deleted_at'),
                fn ($q) => $q->whereNull('deleted_at')
            );

        // 大量でも安定（同期実行）
        $users->chunkById(1000, function ($chunk) use (&$sent, $title, $body, $actionUrl, $meta) {
            Notification::send(
                $chunk,
                new AdminBroadcast($title, $body, $actionUrl, $meta)
            );
            $sent += $chunk->count();
        });

        return response()->json([
            'message' => "通知を送信しました（{$sent}件）",
            'count'   => $sent,
        ]);
    }
}
