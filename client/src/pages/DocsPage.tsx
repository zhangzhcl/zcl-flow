import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { DOCS_SECTIONS, type Lang } from '../data/docs-content';

/**
 * In-app technical & usage documentation.
 * Public route (/docs) so guests can read the docs before signing in.
 */
export default function DocsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const lang: Lang = i18n.language?.startsWith('zh') ? 'zh' : 'en';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              to={user ? '/console' : '/'}
              title={t('common.back')}
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-blue-50">
              <BookOpen size={15} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-gray-900">
              {t('docs.title')}
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
        {/* ---- TOC ---- */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-1 border-l border-gray-200 pl-4">
            {DOCS_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-md px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                {section.title[lang]}
              </a>
            ))}
          </nav>
        </aside>

        {/* ---- Content ---- */}
        <main className="min-w-0 flex-1">
          <div className="mb-10">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400">
              Documentation
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              {t('docs.heading')}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">{t('docs.subtitle')}</p>
          </div>

          {DOCS_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="mb-12 scroll-mt-20">
              <h2 className="mb-5 border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900">
                {section.title[lang]}
              </h2>
              <div className="space-y-5">
                {section.blocks.map((block, index) => {
                  switch (block.kind) {
                    case 'p':
                      return (
                        <p key={index} className="text-sm leading-relaxed text-gray-600">
                          {block.text[lang]}
                        </p>
                      );
                    case 'h3':
                      return (
                        <h3 key={index} className="pt-1 text-sm font-semibold text-gray-800">
                          {block.text[lang]}
                        </h3>
                      );
                    case 'list':
                      return (
                        <ul key={index} className="space-y-2.5">
                          {block.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3 text-sm text-gray-600">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                              <span className="leading-relaxed">{item[lang]}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    case 'code':
                      return (
                        <div key={index} className="overflow-hidden rounded-lg border border-gray-200 bg-gray-900">
                          {block.label && (
                            <div className="border-b border-gray-700 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">
                              {block.label}
                            </div>
                          )}
                          <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed text-gray-200">
                            {block.text}
                          </pre>
                        </div>
                      );
                    case 'table':
                      return (
                        <div key={index} className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-gray-200 bg-gray-50">
                                {block.head.map((cell, cellIndex) => (
                                  <th key={cellIndex} className="px-4 py-2.5 font-semibold text-gray-700">
                                    {cell[lang]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {block.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-gray-100 last:border-0 odd:bg-white even:bg-gray-50">
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-2.5 align-top leading-relaxed text-gray-600">
                                      {cell[lang]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                  }
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
