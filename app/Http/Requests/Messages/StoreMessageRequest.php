<?php

namespace App\Http\Requests\Messages;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMessageRequest extends FormRequest
{
    /**
     * 取引当事者のみ送信可
     */
    public function authorize(): bool
    {
        $user  = $this->user();
        $trade = $this->route('trade'); // ルートモデルバインディング: /trades/{trade}/messages

        if (!$user || !$trade) {
            return false;
        }

        // buyer または seller ならOK（運営のシステム送信はコントローラ側で別途許可）
        return (int)$trade->buyer_id === (int)$user->id
            || (int)$trade->seller_id === (int)$user->id;
    }

    /**
     * バリデーションルール
     */
    public function rules(): array
    {
        return [
            // 本文：任意（最大5000）
            'body'        => ['nullable', 'string', 'max:5000'],

            // 添付画像：配列 & 各要素に画像制約（最大3枚）
            'images'      => ['nullable', 'array', 'max:3'],
            'images.*'    => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5MB
        ];
    }

    /**
     * 日本語メッセージ
     */
    public function messages(): array
    {
        return [
            'body.max'          => '本文は5000文字以内で入力してください。',
            'images.array'      => '画像の形式が不正です。',
            'images.max'        => '画像は最大3枚までアップロードできます。',
            'images.*.image'    => 'アップロードできるのは画像ファイルのみです。',
            'images.*.mimes'    => '画像は jpg / jpeg / png / webp のみ対応です。',
            'images.*.max'      => '各画像は5MB以下にしてください。',
        ];
    }

    /**
     * 項目名ラベル
     */
    public function attributes(): array
    {
        return [
            'body'     => '本文',
            'images'   => '画像',
            'images.*' => '画像',
        ];
    }

    /**
     * 前処理（トリム等）
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('body')) {
            $this->merge([
                'body' => is_string($this->input('body')) ? trim($this->input('body')) : $this->input('body'),
            ]);
        }
    }

    /**
     * 追加バリデーション：「本文 or 画像のどちらか必須」
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $hasBody   = is_string($this->input('body')) && trim($this->input('body')) !== '';
            $hasImages = is_array($this->file('images')) && count($this->file('images')) > 0;

            if (!$hasBody && !$hasImages) {
                $v->errors()->add('body', '本文または画像を1つ以上送信してください。');
            }
        });
    }
}
