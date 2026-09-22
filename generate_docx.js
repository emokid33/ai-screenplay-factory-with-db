const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, 
        BorderStyle, TabStopType, TabStopPosition, PageBreak, Footer, 
        PageNumber, NumberFormat } = require('docx');
const fs = require('fs');

/**
 * Генерация Word документа со сценарием
 * Использует профессиональное форматирование киноиндустрии
 */

function createScreenplayDocument(data) {
    const { userIdea, genre, prompt, screenplay, wordCount, sceneCount, createdAt } = data;

    // Стили для сценария
    const styles = {
        default: {
            document: {
                run: {
                    font: "Courier New", // Стандартный шрифт для сценариев
                    size: 24 // 12pt
                }
            }
        },
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    size: 32,
                    bold: true,
                    font: "Arial"
                },
                paragraph: {
                    spacing: { before: 480, after: 240 },
                    outlineLevel: 0
                }
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    size: 28,
                    bold: true,
                    font: "Arial"
                },
                paragraph: {
                    spacing: { before: 360, after: 180 },
                    outlineLevel: 1
                }
            },
            {
                id: "SceneHeading",
                name: "Scene Heading",
                basedOn: "Normal",
                run: {
                    font: "Courier New",
                    size: 24,
                    bold: true,
                    allCaps: true
                },
                paragraph: {
                    spacing: { before: 240, after: 120 }
                }
            },
            {
                id: "Action",
                name: "Action",
                basedOn: "Normal",
                run: {
                    font: "Courier New",
                    size: 24
                },
                paragraph: {
                    spacing: { after: 120 }
                }
            },
            {
                id: "Character",
                name: "Character",
                basedOn: "Normal",
                run: {
                    font: "Courier New",
                    size: 24,
                    allCaps: true
                },
                paragraph: {
                    spacing: { before: 120, after: 60 },
                    indent: { left: 3600 } // 2.5 дюйма
                }
            },
            {
                id: "Dialogue",
                name: "Dialogue",
                basedOn: "Normal",
                run: {
                    font: "Courier New",
                    size: 24
                },
                paragraph: {
                    spacing: { after: 120 },
                    indent: { left: 2160, right: 2160 } // 1.5 дюйма с каждой стороны
                }
            },
            {
                id: "Parenthetical",
                name: "Parenthetical",
                basedOn: "Normal",
                run: {
                    font: "Courier New",
                    size: 24,
                    italics: true
                },
                paragraph: {
                    spacing: { after: 60 },
                    indent: { left: 3000 }
                }
            }
        ]
    };

    // Титульная страница
    const titlePage = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 4320 }, // 3 дюйма сверху
            children: [
                new TextRun({
                    text: "СЦЕНАРИЙ ФИЛЬМА",
                    font: "Arial",
                    size: 32,
                    bold: true
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 240 },
            children: [
                new TextRun({
                    text: genre ? genre.toUpperCase() : "ПОЛНОМЕТРАЖНЫЙ ФИЛЬМ",
                    font: "Arial",
                    size: 28
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 960 },
            children: [
                new TextRun({
                    text: "Сгенерировано AI Системой",
                    font: "Arial",
                    size: 20,
                    italics: true
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120 },
            children: [
                new TextRun({
                    text: new Date(createdAt).toLocaleDateString('ru-RU'),
                    font: "Arial",
                    size: 20
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1440 },
            children: [
                new TextRun({
                    text: `Слов: ${wordCount || 'N/A'} | Сцен: ${sceneCount || 'N/A'}`,
                    font: "Arial",
                    size: 20
                })
            ]
        }),
        new Paragraph({
            children: [new PageBreak()]
        })
    ];

    // Страница с исходной идеей
    const ideaPage = [
        new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
                new TextRun({
                    text: "ИСХОДНАЯ ИДЕЯ",
                    font: "Arial"
                })
            ]
        }),
        new Paragraph({
            spacing: { after: 240 },
            children: [
                new TextRun({
                    text: userIdea,
                    font: "Arial",
                    size: 24
                })
            ]
        }),
        new Paragraph({
            children: [new PageBreak()]
        })
    ];

    // Страница с промптом (если есть)
    const promptPage = prompt ? [
        new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
                new TextRun({
                    text: "ТВОРЧЕСКИЙ ПРОМПТ",
                    font: "Arial"
                })
            ]
        }),
        new Paragraph({
            spacing: { after: 240 },
            children: [
                new TextRun({
                    text: prompt,
                    font: "Arial",
                    size: 22
                })
            ]
        }),
        new Paragraph({
            children: [new PageBreak()]
        })
    ] : [];

    // Парсинг и форматирование сценария
    const screenplayParagraphs = parseScreenplay(screenplay);

    // Создание документа
    const doc = new Document({
        styles: styles,
        sections: [{
            properties: {
                page: {
                    size: {
                        width: 12240,  // US Letter
                        height: 15840
                    },
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    children: ["Страница ", PageNumber.CURRENT]
                                })
                            ]
                        })
                    ]
                })
            },
            children: [
                ...titlePage,
                ...ideaPage,
                ...promptPage,
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    children: [
                        new TextRun({
                            text: "СЦЕНАРИЙ",
                            font: "Arial"
                        })
                    ]
                }),
                new Paragraph({ text: "" }),
                ...screenplayParagraphs
            ]
        }]
    });

    return doc;
}

/**
 * Парсинг текста сценария в форматированные параграфы
 */
function parseScreenplay(screenplay) {
    const lines = screenplay.split('\n');
    const paragraphs = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            paragraphs.push(new Paragraph({ text: "" }));
            continue;
        }

        // Определение типа строки
        if (/^(СЦЕНА|INT\.|EXT\.|ВНУТРИ|СНАРУЖИ)/i.test(line)) {
            // Заголовок сцены
            paragraphs.push(new Paragraph({
                style: "SceneHeading",
                children: [new TextRun(line)]
            }));
        } else if (/^[А-ЯA-Z][А-ЯA-Z\s]+:?$/i.test(line) && line.length < 50) {
            // Имя персонажа (заглавные буквы)
            paragraphs.push(new Paragraph({
                style: "Character",
                children: [new TextRun(line.replace(/:$/, ''))]
            }));
        } else if (/^\(.+\)$/.test(line)) {
            // Ремарка (в скобках)
            paragraphs.push(new Paragraph({
                style: "Parenthetical",
                children: [new TextRun(line)]
            }));
        } else if (/^(АКТ|FADE|CUT TO|DISSOLVE|MONTAGE)/i.test(line)) {
            // Технические указания
            paragraphs.push(new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({
                    text: line,
                    font: "Courier New",
                    size: 24
                })]
            }));
        } else {
            // Обычное описание действия или диалог
            const previousLine = i > 0 ? lines[i - 1].trim() : '';
            const isDialogue = /^[А-ЯA-Z][А-ЯA-Z\s]+:?$/i.test(previousLine) && previousLine.length < 50;
            
            paragraphs.push(new Paragraph({
                style: isDialogue ? "Dialogue" : "Action",
                children: [new TextRun(line)]
            }));
        }
    }
    
    return paragraphs;
}

/**
 * Главная функция для создания документа
 */
async function generateDocx(data, outputPath) {
    try {
        const doc = createScreenplayDocument(data);
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);
        return { success: true, path: outputPath };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Экспорт для использования как модуль
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateDocx, createScreenplayDocument };
}

// CLI использование
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node generate_docx.js <data.json> [output.docx]');
        process.exit(1);
    }
    
    const dataFile = args[0];
    const outputFile = args[1] || 'screenplay.docx';
    
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    generateDocx(data, outputFile)
        .then(result => {
            if (result.success) {
                console.log(`✅ Документ создан: ${result.path}`);
            } else {
                console.error(`❌ Ошибка: ${result.error}`);
            }
        })
        .catch(err => {
            console.error(`❌ Ошибка: ${err.message}`);
        });
}
