/**
 * プライバシーポリシーページ
 */

import { Layout } from '@/components/Layout';

export function PrivacyPage() {
  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900">プライバシーポリシー</h1>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. 基本方針</h2>
            <p className="leading-relaxed">
              青春18きっぷランダム旅行（以下「本サービス」といいます）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける個人情報の取扱いについて定めるものです。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. 収集する情報</h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                本サービスでは、以下の情報を収集します。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>出発駅名（検索のために一時的に使用）</li>
              </ul>
              <p className="leading-relaxed mt-2 text-sm text-gray-600">
                ※ 入力された駅名は、目的地の提案のためにのみ使用され、保存されません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. 情報の利用目的</h2>
            <p className="leading-relaxed">
              収集した情報は、本サービスの提供・運営のためにのみ利用します。具体的には、入力された出発駅情報をもとにランダムな目的地を提案する機能の実現に使用されます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. 情報の第三者提供</h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                本サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm leading-relaxed">
                  <strong>外部サービスの利用について：</strong><br />
                  本サービスは、経路情報の提供のため、ジョルダン等の外部サービスへのリンクを提供しています。これらの外部サービスには、それぞれのプライバシーポリシーが適用されます。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. 情報の安全管理</h2>
            <p className="leading-relaxed">
              本サービスは、収集した情報の漏洩、滅失、毀損等を防止するため、適切な安全管理措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. お問い合わせ窓口</h2>
            <p className="leading-relaxed">
              本プライバシーポリシーに関するお問い合わせは、本サービスのお問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. プライバシーポリシーの変更</h2>
            <p className="leading-relaxed">
              本プライバシーポリシーは、法令の変更や本サービスの機能追加等に伴い、予告なく変更されることがあります。変更後のプライバシーポリシーは、本サイト上に掲載された時点で効力を生じるものとします。
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">制定日：2025年1月1日</p>
            <p className="text-sm text-gray-600">最終更新日：2025年1月1日</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
