<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Group;

class GroupApiController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $group = Group::create([
            'name' => $request->name,
            'created_by' => $request->user()->id,
        ]);

        // 作成者自身をグループに参加させる
        $group->users()->attach($request->user()->id);

        return response()->json([
            'message' => 'グループが作成されました',
            'group' => $group
        ]);
    }
    public function addUser(Request $request, Group $group)
{
    // 作成者チェック
    if ($group->created_by !== $request->user()->id) {
        return response()->json(['message' => '許可されていません'], 403);
    }

    // バリデーション
    $request->validate([
        'user_id' => 'required|exists:users,id',
    ]);

    // すでに参加していないかチェック
    if ($group->users()->where('user_id', $request->user_id)->exists()) {
        return response()->json(['message' => 'このユーザーはすでにグループに参加しています'], 409);
    }

    // 追加
    $group->users()->attach($request->user_id);

    return response()->json(['message' => 'ユーザーをグループに追加しました']);
}
public function myGroups(Request $request)
{
    $user = $request->user();

    $groups = $user->groups()->select('groups.id', 'groups.name')->get();

    return response()->json($groups);
}
}
