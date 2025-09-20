<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/me/notifications
     * 返却形をフロント期待の { items: [...], unread_count } に統一。
     * items[].data に { kind,title,body,action_url,meta } を入れる。
     */
    public function index(Request $request)
    {
        $user   = $request->user();
        $unread = $request->boolean('unread', false);
        $perPage = min(100, $request->integer('per_page', 20));

        $query = $unread ? $user->unreadNotifications() : $user->notifications();
        $paginator = $query->latest('created_at')->paginate($perPage);

        // コレクションを“期待形”に正規化
        $items = $paginator->getCollection()->map(function ($n) {
            return [
                'id'         => $n->id,
                'data'       => [
                    'kind'       => $n->data['kind'] ?? null,
                    'title'      => $n->data['title'] ?? '',
                    'body'       => $n->data['body'] ?? '',
                    'action_url' => $n->data['action_url'] ?? null,
                    'meta'       => $n->data['meta'] ?? null,
                ],
                'read_at'    => $n->read_at,
                'created_at' => optional($n->created_at)->toISOString(),
            ];
        })->values();

        return response()->json([
            'items'        => $items,
            'unread_count' => $user->unreadNotifications()->count(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    /** POST /api/me/notifications/{id}/read */
    public function markRead(Request $request, string $id)
    {
        $n = $request->user()->notifications()->whereKey($id)->firstOrFail();
        if (!$n->read_at) {
            $n->markAsRead();
        }
        return response()->json(['ok' => true]);
    }

    /** POST /api/me/notifications/read-all */
    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['ok' => true]);
    }
}
