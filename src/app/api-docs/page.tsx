'use client';

import { useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function ApiDocsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load Swagger UI CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
        document.head.appendChild(link);

        // Load Swagger UI JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js';
        script.onload = () => {
            // @ts-ignore
            if (window.SwaggerUIBundle && containerRef.current) {
                // @ts-ignore
                window.SwaggerUIBundle({
                    url: '/openapi.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        // @ts-ignore
                        window.SwaggerUIBundle.presets.apis,
                        // @ts-ignore
                        window.SwaggerUIBundle.SwaggerUIStandalonePreset
                    ],
                    layout: 'BaseLayout',
                    defaultModelsExpandDepth: 1,
                    defaultModelExpandDepth: 1,
                    docExpansion: 'list',
                    filter: true,
                    showExtensions: true,
                    showCommonExtensions: true,
                    syntaxHighlight: {
                        activate: true,
                        theme: 'monokai'
                    }
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
            document.head.removeChild(link);
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>API Documentation</h1>
                    <p className={styles.subtitle}>
                        Interaktywna dokumentacja REST API platformy OCPD
                    </p>
                </div>
                <div className={styles.links}>
                    <a href="/openapi.json" target="_blank" className={styles.link}>
                        OpenAPI JSON
                    </a>
                </div>
            </header>

            <div className={styles.swaggerContainer}>
                <div id="swagger-ui" ref={containerRef} />
            </div>
        </div>
    );
}
