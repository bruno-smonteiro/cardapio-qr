import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const CATEGORY_NAV_OFFSET = 148

function formatPrice(price) {
    return Number(price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })
}

function getCategoryId(category) {
    return `category-${category.id}`
}

export default function MenuPage() {
    const { slug } = useParams()
    const [restaurant, setRestaurant] = useState(null)
    const [categories, setCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState(null)
    const [search, setSearch] = useState('')
    const [shareState, setShareState] = useState('')
    const [error, setError] = useState('')
    const deferredSearch = useDeferredValue(search)
    const sectionRefs = useRef({})

    useEffect(() => {
        let ignore = false

        api.get(`/api/menu/${slug}`)
            .then(({ data }) => {
                if (ignore) return

                const nextCategories = [...data.categories]
                if (data.uncategorized?.length) {
                    nextCategories.push({
                        id: 'uncategorized',
                        name: 'Mais pedidos',
                        products: data.uncategorized,
                    })
                }

                setRestaurant(data.restaurant)
                setCategories(nextCategories)
                if (nextCategories.length > 0) {
                    setActiveCategory(nextCategories[0].id)
                }
            })
            .catch(() => {
                if (!ignore) setError('Cardapio nao encontrado')
            })

        return () => {
            ignore = true
        }
    }, [slug])

    useEffect(() => {
        if (!shareState) return undefined

        const timeout = window.setTimeout(() => setShareState(''), 2400)
        return () => window.clearTimeout(timeout)
    }, [shareState])

    const filteredCategories = useMemo(() => {
        const normalizedSearch = deferredSearch.trim().toLowerCase()

        if (!normalizedSearch) return categories

        return categories
            .map((category) => ({
                ...category,
                products: category.products.filter((product) => {
                    const haystack = [product.name, product.description, category.name]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()

                    return haystack.includes(normalizedSearch)
                }),
            }))
            .filter((category) => category.products.length > 0)
    }, [categories, deferredSearch])

    useEffect(() => {
        if (!filteredCategories.length) return undefined

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

                if (visibleEntries.length > 0) {
                    setActiveCategory(visibleEntries[0].target.dataset.categoryId)
                }
            },
            {
                rootMargin: '-140px 0px -55% 0px',
                threshold: 0.15,
            }
        )

        filteredCategories.forEach((category) => {
            const node = sectionRefs.current[category.id]
            if (node) observer.observe(node)
        })

        return () => observer.disconnect()
    }, [filteredCategories])

    useEffect(() => {
        if (!filteredCategories.length) {
            setActiveCategory(null)
            return
        }

        const hasActiveCategory = filteredCategories.some((category) => category.id === activeCategory)
        if (!hasActiveCategory) {
            setActiveCategory(filteredCategories[0].id)
        }
    }, [activeCategory, filteredCategories])

    async function handleShare() {
        if (!restaurant) return

        const shareUrl = window.location.href
        const shareData = {
            title: restaurant.name,
            text: `Veja o cardapio de ${restaurant.name}`,
            url: shareUrl,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
                setShareState('Link compartilhado')
                return
            }

            await navigator.clipboard.writeText(shareUrl)
            setShareState('Link copiado')
        } catch {
            setShareState('Nao foi possivel compartilhar agora')
        }
    }

    function scrollToCategory(categoryId) {
        const element = sectionRefs.current[categoryId]
        if (!element) return

        const top = element.getBoundingClientRect().top + window.scrollY - CATEGORY_NAV_OFFSET
        window.scrollTo({ top, behavior: 'smooth' })
        setActiveCategory(categoryId)
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-100 px-6 py-16">
                <div className="mx-auto max-w-md rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-xl">
                        !
                    </div>
                    <h1 className="text-2xl font-semibold text-stone-900">Nao encontramos esse cardapio</h1>
                    <p className="mt-3 text-sm leading-6 text-stone-500">{error}</p>
                </div>
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-stone-100 px-6 py-16">
                <div className="mx-auto max-w-md overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-black/5">
                    <div className="h-36 animate-pulse bg-stone-200" />
                    <div className="space-y-4 p-6">
                        <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200" />
                        <div className="h-8 w-2/3 animate-pulse rounded-full bg-stone-200" />
                        <div className="h-11 animate-pulse rounded-2xl bg-stone-100" />
                        <div className="h-24 animate-pulse rounded-3xl bg-stone-100" />
                        <div className="h-24 animate-pulse rounded-3xl bg-stone-100" />
                    </div>
                </div>
            </div>
        )
    }

    const totalProducts = categories.reduce((count, category) => count + category.products.length, 0)
    const hasResults = filteredCategories.length > 0

    return (
        <div className="min-h-screen bg-stone-100 text-stone-900">
            <div className="mx-auto max-w-3xl pb-12">
                <header className="relative overflow-hidden rounded-b-[36px] bg-gradient-to-br from-stone-950 via-stone-900 to-orange-900 px-5 pb-8 pt-6 text-white shadow-xl shadow-orange-950/15 sm:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.24),_transparent_35%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-100/10 to-transparent" />

                    <div className="relative">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-[0.24em] text-orange-200/80">Cardapio digital</p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{restaurant.name}</h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-stone-200">
                                    Navegue por categorias, encontre seus favoritos rapido e compartilhe este menu com facilidade.
                                </p>
                            </div>

                            {restaurant.logo_url ? (
                                <img
                                    src={restaurant.logo_url}
                                    alt={restaurant.name}
                                    className="h-20 w-20 flex-shrink-0 rounded-[24px] border border-white/15 object-cover shadow-lg shadow-black/20"
                                />
                            ) : (
                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[24px] border border-white/15 bg-white/10 text-2xl font-semibold text-white/90">
                                    {restaurant.name.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
                            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                                {categories.length} categorias
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
                                {totalProducts} itens disponiveis
                            </div>
                            <button
                                type="button"
                                onClick={handleShare}
                                className="rounded-full border border-white/10 bg-white px-4 py-2 font-medium text-stone-900 transition hover:bg-orange-50"
                            >
                                Compartilhar menu
                            </button>
                        </div>

                        {shareState && (
                            <p className="mt-3 text-sm text-orange-100">{shareState}</p>
                        )}
                    </div>
                </header>

                <div className="sticky top-0 z-20 border-b border-stone-200/80 bg-stone-100/95 px-4 pb-4 pt-4 backdrop-blur sm:px-6">
                    <div className="rounded-[28px] border border-stone-200 bg-white p-3 shadow-sm shadow-stone-200/40">
                        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                            Buscar no cardapio
                        </label>
                        <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                <span aria-hidden="true">⌕</span>
                            </div>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Busque por hamburguer, pizza, sobremesa..."
                                className="w-full border-0 bg-transparent p-0 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>

                    {hasResults && (
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                            {filteredCategories.map((category) => {
                                const isActive = String(activeCategory) === String(category.id)

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => scrollToCategory(category.id)}
                                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
                                            ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200/50'
                                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <main className="px-4 pt-6 sm:px-6">
                    {hasResults ? (
                        <div className="space-y-8">
                            {filteredCategories.map((category) => (
                                <section
                                    key={category.id}
                                    id={getCategoryId(category)}
                                    data-category-id={category.id}
                                    ref={(node) => {
                                        if (node) {
                                            sectionRefs.current[category.id] = node
                                        }
                                    }}
                                    className="scroll-mt-36"
                                >
                                    <div className="mb-4 flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                                                Categoria
                                            </p>
                                            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
                                                {category.name}
                                            </h2>
                                        </div>
                                        <p className="text-sm text-stone-400">
                                            {category.products.length} {category.products.length === 1 ? 'item' : 'itens'}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {category.products.map((product) => (
                                            <article
                                                key={product.id}
                                                className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/40 transition hover:border-orange-200 hover:shadow-md"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                                                            {category.name}
                                                        </p>
                                                        <h3 className="mt-2 text-lg font-semibold leading-tight text-stone-900">
                                                            {product.name}
                                                        </h3>
                                                        {product.description ? (
                                                            <p
                                                                className="mt-2 text-sm leading-6 text-stone-500"
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitBoxOrient: 'vertical',
                                                                    WebkitLineClamp: 2,
                                                                    overflow: 'hidden',
                                                                }}
                                                            >
                                                                {product.description}
                                                            </p>
                                                        ) : (
                                                            <p className="mt-2 text-sm leading-6 text-stone-400">
                                                                Receita da casa pronta para pedir.
                                                            </p>
                                                        )}
                                                        <p className="mt-4 text-lg font-semibold text-orange-600">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>

                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="h-28 w-28 flex-shrink-0 rounded-[24px] object-cover sm:h-32 sm:w-32"
                                                        />
                                                    ) : (
                                                        <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-[24px] bg-stone-100 text-center text-xs font-medium uppercase tracking-[0.16em] text-stone-400 sm:h-32 sm:w-32">
                                                            Sem foto
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[32px] border border-dashed border-stone-300 bg-white px-6 py-14 text-center shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                                Nenhum resultado
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold text-stone-900">
                                Nada encontrado para "{deferredSearch}"
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
                                Tente buscar por outro prato, bebida ou categoria para encontrar itens no cardapio.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="mt-6 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
                            >
                                Limpar busca
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
