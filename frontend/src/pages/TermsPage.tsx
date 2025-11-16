/**
 * 利用規約ページ
 */

import { Layout } from '@/components/Layout';

export function TermsPage() {
  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900">利用規約</h1>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第1条（適用）</h2>
            <p className="leading-relaxed">
              本規約は、青春18きっぷランダム旅行（以下「本サービス」といいます）の利用条件を定めるものです。本サービスをご利用になる方（以下「ユーザー」といいます）は、本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第2条（サービスの内容）</h2>
            <p className="leading-relaxed mb-4">
              本サービスは、青春18きっぷを利用した旅行のランダムな目的地を提案するサービスです。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>出発駅を入力すると、ランダムに目的地駅を提案します</li>
              <li>駅情報の検索には「駅すぱあと Webサービス」を使用しています</li>
              <li>提案された経路はジョルダンへのリンクで確認できます</li>
              <li>実際の運行情報や料金は外部サービスをご確認ください</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第3条（免責事項）</h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                本サービスは情報提供を目的としており、以下の事項について一切の責任を負いません。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提案された目的地への実際の移動可能性</li>
                <li>列車の運行状況、遅延、運休等</li>
                <li>実際の運賃や所要時間</li>
                <li>青春18きっぷの利用可能期間や条件</li>
                <li>本サービスの利用により発生した損害</li>
              </ul>
              <p className="leading-relaxed mt-4">
                実際の旅行計画は、JR各社の公式情報や時刻表をご確認の上、ご自身の責任で行ってください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第4条（サービスの変更・停止）</h2>
            <p className="leading-relaxed">
              本サービスは、事前の予告なくサービス内容の変更、一時停止、または終了する場合があります。これによりユーザーに生じた損害について、一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第5条（禁止事項）</h2>
            <p className="leading-relaxed mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨げる行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>本サービスに過度な負荷をかける行為</li>
              <li>不正アクセスやクラッキング行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第6条（知的財産権）</h2>
            <p className="leading-relaxed">
              本サービスに関する知的財産権は、すべて本サービス運営者に帰属します。ユーザーは、本サービスの利用許諾のみを得るものであり、知的財産権の譲渡や使用許諾を受けるものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第7条（規約の変更）</h2>
            <p className="leading-relaxed">
              本規約は、ユーザーへの事前の通知なく変更されることがあります。変更後の規約は、本サイト上に掲載された時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">第8条（準拠法・管轄裁判所）</h2>
            <p className="leading-relaxed">
              本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
