<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Listing;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes','string','max:255'],
            'course_name' => ['sometimes','string','max:255'],
            'price'       => ['sometimes','integer','min:100','max:1000000'],
            'description' => ['sometimes','nullable','string','max:2000'],
            'status'      => ['sometimes', Rule::in(['draft','active','sold','hidden'])],

            // ▼ タグ（任意・部分更新OK）
            'tag_subject' => ['sometimes','nullable','string', Rule::in(Listing::SUBJECT_OPTIONS)],
            'tag_field'   => ['sometimes','nullable','string', Rule::in(Listing::FIELD_OPTIONS)],
            'tag_faculty' => ['sometimes','nullable','string', Rule::in(Listing::FACULTY_OPTIONS)],
            'has_writing' => ['sometimes','boolean'],

            // 画像差し替え（まとめて送られてきたら入れ替え）
            'images'      => ['sometimes','array','max:3'],
            'images.*'    => ['file','image','mimes:jpg,jpeg,png,webp','max:5120'],
        ];
    }
}
