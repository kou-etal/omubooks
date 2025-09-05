import React from 'react';
import AppLayout from '../components/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <AppLayout>
      {/* ヒーローセクション */}
      <section className="max-w-5xl mx-auto text-center py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 leading-tight">
          TextbookMarketで<br className="sm:hidden" />教科書をもっと手軽に
        </h1>
        <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
          大阪公立大学をはじめとする学生向けの教科書売買アプリ。
          学期末に余った教科書を簡単に出品・購入できるプラットフォームです。
          手数料はわずか8%、しかも直接受け渡しで送料不要。
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-blue-700 hover:bg-blue-800 px-8 py-6 text-lg">
            <Link to="/register">新規登録</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
            <Link to="/listings">出品一覧を見る</Link>
          </Button>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">かんたん出品</h3>
          <p className="text-gray-600 text-sm leading-6">
            教科書のタイトル、講義名、価格を入力するだけでOK。
            3枚までの画像アップロードにも対応しています。
          </p>
        </div>
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">直接受け渡し</h3>
          <p className="text-gray-600 text-sm leading-6">
            DM機能で受け渡し場所を調整できるから、送料も配送手続きも不要。
            学内取引に最適な仕組みです。
          </p>
        </div>
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">手数料わずか8%</h3>
          <p className="text-gray-600 text-sm leading-6">
            売上から自動で8%だけ運営手数料として計算。
            支払いはPayPay IDに直接送金するだけでスムーズです。
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto text-center py-16">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">いますぐ始めよう</h2>
        <p className="text-gray-600 text-base mb-6">
          会員登録して、不要になった教科書を出品したり、お得に購入したりしませんか？
        </p>
        <Button asChild size="lg" className="bg-blue-700 hover:bg-blue-800 px-10 py-6 text-lg">
          <Link to="/register">無料で登録する</Link>
        </Button>
      </section>
    </AppLayout>
  );
}
