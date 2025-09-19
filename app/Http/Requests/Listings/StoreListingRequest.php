<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Listing;

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

            // ▼ タグ（任意。送られなければ default=none）
            'tag_subject' => ['nullable','string', Rule::in(Listing::SUBJECT_OPTIONS)],
            'tag_field'   => ['nullable','string', Rule::in(Listing::FIELD_OPTIONS)],
            'tag_faculty' => ['nullable','string', Rule::in(Listing::FACULTY_OPTIONS)],
            'has_writing' => ['nullable','boolean'],

            // 画像は最大3枚、5MB、jpg/png/webp
            'images'      => ['sometimes','array','max:3'],
            'images.*'    => ['file','image','mimes:jpg,jpeg,png,webp','max:5120'],
        ];
    }
}

