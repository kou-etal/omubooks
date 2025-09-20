<?php
// app/Http/Requests/Admin/AdminBroadcastRequest.php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdminBroadcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'      => ['required', 'string', 'max:120'],
            'body'       => ['nullable', 'string', 'max:4000'],
            'action_url' => ['nullable', 'string', 'max:1024'], // 外部URL/相対パスどちらも可
            'meta'       => ['nullable', 'array'],
        ];
    }
}
