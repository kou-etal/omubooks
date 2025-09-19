<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Listing;

class SearchListingRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'q'         => ['nullable','string','max:255'],
            'per_page'  => ['nullable','integer','min:1','max:100'],
            'page'      => ['nullable','integer','min:1'],

            // ▼ タグ絞り込み（送られてきた時だけ適用）
            'tag_subject' => ['nullable','string', Rule::in(Listing::SUBJECT_OPTIONS)],
            'tag_field'   => ['nullable','string', Rule::in(Listing::FIELD_OPTIONS)],
            'tag_faculty' => ['nullable','string', Rule::in(Listing::FACULTY_OPTIONS)],
            'has_writing' => ['nullable','boolean'],
        ];
    }
}
