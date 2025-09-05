<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        // 学部・学科はマイグレでenum運用だが、ここではRule::inで同等制約
        $faculties = ['工学部','理学部','文学部','法学部','経済学部','商学部','医学部','看護学部','その他'];
        return [
            'name'        => ['sometimes','string','max:255'],
            'bio'         => ['sometimes','nullable','string','max:2000'],
            'faculty'     => ['sometimes','nullable', Rule::in($faculties)],
            'paypay_id'   => ['sometimes','nullable','regex:/^@[A-Za-z0-9._-]{3,20}$/','unique:users,paypay_id,' . $this->user()->id],
        ];
    }

    public function messages(): array
    {
        return [
            'paypay_id.regex' => 'PayPay IDは @から始まる3〜20文字で入力してください。',
        ];
    }
}
