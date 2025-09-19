<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray($request): array
    {
        // 日本語ラベル（必要に応じてフロント側でマップしてもOK）
        $subjectLabels = [
            'liberal_arts' => '一般教養',
            'basic_education' => '基礎教育科目',
            'specialized' => '専門科目',
            'other' => 'その他',
            'none' => 'なし',
        ];
        $fieldLabels = [
            'math' => '数学','physics' => '物理','chemistry' => '化学','biology' => '生物','english' => '英語',
            'other' => 'その他','none' => 'なし',
        ];
        $facultyLabels = [
            'modern_system_science' => '現代システム科学','law' => '法学部','commerce' => '商学部','engineering' => '工学部',
            'veterinary' => '獣医学部','medicine' => '医学部','human_life_science' => '生活科学部','letters' => '文学部',
            'economics' => '経済学部','science' => '理学部','agriculture' => '農学部','nursing' => '看護学部',
            'other' => 'その他','none' => 'なし',
        ];

        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'course_name' => $this->course_name,
            'price'       => (int) $this->price,
            'description' => $this->description,
            'status'      => $this->status,

            // 画像
            'images'      => $this->whenLoaded('images', fn () => $this->images->pluck('path')),

            // 出品者
            'seller'      => $this->whenLoaded('user', function () {
                return [
                    'id'          => $this->user->id,
                    'name'        => $this->user->name,
                    'rating_avg'  => $this->user->rating_avg,
                    'deals_count' => $this->user->deals_count,
                ];
            }),

            // ▼ タグ（スラッグ＋表示名）
            'tags' => [
                'subject'     => $this->tag_subject,
                'subject_label'=> $subjectLabels[$this->tag_subject] ?? null,
                'field'       => $this->tag_field,
                'field_label' => $fieldLabels[$this->tag_field] ?? null,
                'faculty'     => $this->tag_faculty,
                'faculty_label'=> $facultyLabels[$this->tag_faculty] ?? null,
                'has_writing' => (bool) $this->has_writing,
            ],

            'created_at'  => $this->created_at,
        ];
    }
}
