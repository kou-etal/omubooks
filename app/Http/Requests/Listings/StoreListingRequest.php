<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            'title'       => ['required','string','max:255'],
            'course_name' => ['required','string','max:255'],
            'price'       => ['required','integer','min:100','max:1000000'],
            'description' => ['nullable','string','max:2000'],

            // 画像は最大3枚、5MB、jpg/png/webp
            'images'      => ['sometimes','array','max:3'],
            'images.*'    => ['file','image','mimes:jpg,jpeg,png,webp','max:5120'],

            // ▼ 追加：公開 or 下書き
            'status'      => ['nullable', Rule::in(['active','draft'])],

            // ▼ タグ（既存どおり）
            'tag_subject' => ['nullable','string', Rule::in(['liberal_arts','basic_education','specialized','other','none'])],
            'tag_field'   => ['nullable','string', Rule::in(['math','physics','chemistry','biology','english','other','none'])],
            'tag_faculty' => ['nullable','string', Rule::in([
                'modern_system_science','law','commerce','engineering','veterinary','medicine',
                'human_life_science','letters','economics','science','agriculture','nursing','other','none'
            ])],
            'has_writing' => ['nullable','boolean'],
        ];
    }
}


