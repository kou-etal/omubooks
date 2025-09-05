<?php

namespace App\Http\Requests\Trades;

use Illuminate\Foundation\Http\FormRequest;

class PayPlatformRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            // 任意の証跡スクショ（5MBまで）
            'proof' => ['sometimes','file','image','mimes:jpg,jpeg,png,webp','max:5120'],
        ];
    }
}
