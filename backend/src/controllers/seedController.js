const pool = require('../db');

const italianMenu = [
    {
        name: 'Antipasti',
        sortOrder: 1,
        products: [
            {
                name: 'Bruschetta Classica',
                description: 'Fatias de pao italiano tostado com tomate fresco, manjericao, alho e azeite extra virgem.',
                price: 24.9,
                sortOrder: 1,
                imageUrl: 'https://loremflickr.com/640/480/bruschetta?lock=101',
            },
            {
                name: 'Burrata al Pesto',
                description: 'Burrata cremosa servida com pesto de manjericao, tomate confit e focaccia quentinha.',
                price: 36.9,
                sortOrder: 2,
                imageUrl: 'https://loremflickr.com/640/480/burrata?lock=102',
            },
            {
                name: 'Arancini Siciliani',
                description: 'Bolinho crocante de risoto recheado com mozzarella e ragu suave de tomate.',
                price: 29.9,
                sortOrder: 3,
                imageUrl: 'https://loremflickr.com/640/480/arancini?lock=103',
            },
        ],
    },
    {
        name: 'Massas',
        sortOrder: 2,
        products: [
            {
                name: 'Spaghetti alla Carbonara',
                description: 'Massa al dente envolvida em molho cremoso de gemas, pecorino romano e pancetta crocante.',
                price: 52.9,
                sortOrder: 1,
                imageUrl: 'https://loremflickr.com/640/480/carbonara?lock=201',
            },
            {
                name: 'Fettuccine Alfredo al Tartufo',
                description: 'Fettuccine fresco com creme de parmesao, manteiga e toque aromatico de tartufo.',
                price: 58.9,
                sortOrder: 2,
                imageUrl: 'https://loremflickr.com/640/480/fettuccine?lock=202',
            },
            {
                name: 'Ravioli di Ricotta',
                description: 'Ravioli artesanal recheado com ricotta e espinafre ao molho de manteiga e sálvia.',
                price: 56.9,
                sortOrder: 3,
                imageUrl: 'https://loremflickr.com/640/480/ravioli?lock=203',
            },
            {
                name: 'Penne alla Vodka',
                description: 'Penne em molho rosado a base de tomate, creme fresco, parmesao e toque de vodka.',
                price: 49.9,
                sortOrder: 4,
                imageUrl: 'https://loremflickr.com/640/480/penne?lock=204',
            },
        ],
    },
    {
        name: 'Pizzas Artesanais',
        sortOrder: 3,
        products: [
            {
                name: 'Margherita DOP',
                description: 'Molho de tomate italiano, mozzarella de alta umidade, manjericao fresco e azeite.',
                price: 54.9,
                sortOrder: 1,
                imageUrl: 'https://loremflickr.com/640/480/margherita,pizza?lock=301',
            },
            {
                name: 'Diavola',
                description: 'Pizza com salame picante, mozzarella, molho artesanal e finalizacao levemente apimentada.',
                price: 61.9,
                sortOrder: 2,
                imageUrl: 'https://loremflickr.com/640/480/pepperoni,pizza?lock=302',
            },
            {
                name: 'Funghi e Parma',
                description: 'Cogumelos salteados, presunto de parma, mozzarella e lascas de parmesao.',
                price: 67.9,
                sortOrder: 3,
                imageUrl: 'https://loremflickr.com/640/480/mushroom,pizza?lock=303',
            },
        ],
    },
    {
        name: 'Risotos',
        sortOrder: 4,
        products: [
            {
                name: 'Risoto ai Funghi',
                description: 'Arroz arboreo cremoso com mix de cogumelos, parmesao maturado e manteiga.',
                price: 57.9,
                sortOrder: 1,
                imageUrl: 'https://loremflickr.com/640/480/risotto,mushroom?lock=401',
            },
            {
                name: 'Risoto al Limone e Gamberi',
                description: 'Risoto delicado de limao siciliano com camaroes grelhados e raspas citricas.',
                price: 64.9,
                sortOrder: 2,
                imageUrl: 'https://loremflickr.com/640/480/shrimp,risotto?lock=402',
            },
        ],
    },
    {
        name: 'Dolci',
        sortOrder: 5,
        products: [
            {
                name: 'Tiramisu Tradizionale',
                description: 'Camadas de mascarpone, cafe espresso e biscoito savoiardi finalizadas com cacau.',
                price: 26.9,
                sortOrder: 1,
                imageUrl: 'https://loremflickr.com/640/480/tiramisu?lock=501',
            },
            {
                name: 'Panna Cotta ai Frutti Rossi',
                description: 'Sobremesa cremosa com baunilha natural e calda intensa de frutas vermelhas.',
                price: 24.9,
                sortOrder: 2,
                imageUrl: 'https://loremflickr.com/640/480/panna-cotta?lock=502',
            },
            {
                name: 'Cannoli Siciliani',
                description: 'Tubos crocantes recheados com creme de ricotta doce, raspas de laranja e pistache.',
                price: 23.9,
                sortOrder: 3,
                imageUrl: 'https://loremflickr.com/640/480/cannoli?lock=503',
            },
        ],
    },
    {
        name: 'Bebidas',
        sortOrder: 6,
        products: [
            {
                name: 'Soda Italiana de Limoncello',
                description: 'Refrescante soda artesanal com limao siciliano, hortela e toque de limoncello.',
                price: 16.9,
                sortOrder: 1,
                imageUrl: 'https://loremflickr.com/640/480/italian,soda?lock=601',
            },
            {
                name: 'Spritz Veneziano',
                description: 'Coquetel leve e borbulhante com bitter italiano, prosecco e rodela de laranja.',
                price: 29.9,
                sortOrder: 2,
                imageUrl: 'https://loremflickr.com/640/480/spritz?lock=602',
            },
            {
                name: 'Espresso Doppio',
                description: 'Dose dupla de cafe espresso encorpado para fechar a refeicao no estilo italiano.',
                price: 9.9,
                sortOrder: 3,
                imageUrl: 'https://loremflickr.com/640/480/espresso?lock=603',
            },
        ],
    },
];

async function seedItalianMenu(req, res) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let categoriesCreated = 0;
        let productsCreated = 0;

        for (const category of italianMenu) {
            let categoryId;

            const existingCategory = await client.query(
                'SELECT id FROM categories WHERE restaurant_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1',
                [req.user.restaurantId, category.name]
            );

            if (existingCategory.rows.length > 0) {
                categoryId = existingCategory.rows[0].id;

                await client.query(
                    'UPDATE categories SET sort_order = $1 WHERE id = $2',
                    [category.sortOrder, categoryId]
                );
            } else {
                const insertedCategory = await client.query(
                    'INSERT INTO categories (restaurant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id',
                    [req.user.restaurantId, category.name, category.sortOrder]
                );

                categoryId = insertedCategory.rows[0].id;
                categoriesCreated += 1;
            }

            for (const product of category.products) {
                const existingProduct = await client.query(
                    `SELECT id FROM products
                     WHERE restaurant_id = $1 AND category_id = $2 AND LOWER(name) = LOWER($3)
                     LIMIT 1`,
                    [req.user.restaurantId, categoryId, product.name]
                );

                if (existingProduct.rows.length > 0) {
                    continue;
                }

                await client.query(
                    `INSERT INTO products (
                        restaurant_id, category_id, name, description, price, image_url, sort_order, available
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
                    [
                        req.user.restaurantId,
                        categoryId,
                        product.name,
                        product.description,
                        product.price,
                        product.imageUrl,
                        product.sortOrder,
                    ]
                );

                productsCreated += 1;
            }
        }

        await client.query('COMMIT');

        res.json({
            message: 'Menu italiano criado com sucesso',
            categoriesCreated,
            productsCreated,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar menu italiano' });
    } finally {
        client.release();
    }
}

module.exports = { seedItalianMenu };
