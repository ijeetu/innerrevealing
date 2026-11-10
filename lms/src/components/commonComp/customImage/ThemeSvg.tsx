import React, { useEffect, useState, CSSProperties } from "react";

/**
 * Color mapping type for theme color replacements
 */
interface ColorMap {
    [key: string]: string;
}

/**
 * ThemeSvg component props
 */
interface ThemeSvgProps {
    src: string | { src: string; default?: string };
    width?: number | string;
    height?: number | string;
    className?: string;
    alt?: string;
    colorMap?: ColorMap;
}

/**
 * ThemeSvg component that renders an SVG with theme colors
 *
 * @param {Object} props - Component props
 * @param {string} props.src - Source path to the SVG file
 * @param {number|string} props.width - Width of the SVG
 * @param {number|string} props.height - Height of the SVG
 * @param {string} props.className - CSS class for the SVG
 * @param {string} props.alt - Alt text for the SVG
 * @param {Object} props.colorMap - Optional mapping of original colors to CSS variables
 * @returns {React.ReactElement}
 */
const ThemeSvg: React.FC<ThemeSvgProps> = ({ src, width, height, className, alt, colorMap = {} }) => {
    const [svgContent, setSvgContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [cssVarValues, setCssVarValues] = useState<string>("");

    // Normalize src to handle both string URLs and imported SVG modules
    const svgUrl = typeof src === 'string' ? src : (src?.src || src?.default || '');

    // Monitor CSS variable changes to trigger re-processing
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateCssVars = () => {
            const computedStyle = window.getComputedStyle(document.documentElement);
            const primary = computedStyle.getPropertyValue('--primary-color').trim();
            const light = computedStyle.getPropertyValue('--primary-light-color').trim();
            const hover = computedStyle.getPropertyValue('--hover-color').trim();

            setCssVarValues(`${primary}|${light}|${hover}`);
        };

        updateCssVars();

        const observer = new MutationObserver(updateCssVars);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!svgUrl) {
            setError("No source provided");
            setIsLoading(false);
            return;
        }

        // Create a merged color map with defaults and user provided mappings
        const fullColorMap = {
            // Primary colors
            "#e13975": "var(--primary-color)",
            "#5A5BB5": "var(--primary-color)",
            "#5a5bb5": "var(--primary-color)",
            "#0F31AC": "var(--primary-color)",

            // Hover / Secondary colors
            "#6d1d50": "var(--hover-color)",
            "#04294C": "var(--hover-color)",
            "#02203D": "var(--hover-color)",

            // Light colors
            "#f7ccdd": "var(--primary-light-color)",
            "#EEF2FA": "var(--primary-light-color)",
            "#D3DCEF": "var(--primary-light-color)",
            "#F4F6FC": "var(--primary-light-color)",
            "#E3E9F7": "var(--primary-light-color)",

            // User mappings override defaults
            ...colorMap
        };

        const loadSvg = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch the SVG
                const response = await fetch(svgUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch SVG: ${response.status}`);
                }

                // Get SVG text
                const originalSvg = await response.text();

                // Process the SVG to apply theme colors
                const processedSvg = processSvg(originalSvg, fullColorMap);

                setSvgContent(processedSvg);
                setIsLoading(false);
            } catch (error: unknown) {
                console.error("Error loading SVG:", error);
                setError(error as string);
                setIsLoading(false);
            }
        };

        loadSvg();
    }, [svgUrl, JSON.stringify(colorMap), cssVarValues]);
    ///////////////////////src, colorMap
    /**
     * Process SVG text to apply theme colors and handle gradients
     */
    const processSvg = (svgText: string, colorMapping: ColorMap): string => {
        try {
            let processedSvg = svgText;

            // 1. Create a unique ID for any gradients
            const uniqueId = `svg-grad-${Date.now()}`;

            // 2. Update gradient IDs and references to avoid conflicts
            // This regex finds all IDs and their corresponding url(#ID) references
            const idRegex = /id="([^"]+)"/g;
            let match;
            const idMap: { [key: string]: string } = {};

            while ((match = idRegex.exec(svgText)) !== null) {
                const oldId = match[1];
                const newId = `${oldId}-${uniqueId}`;
                idMap[oldId] = newId;
                processedSvg = processedSvg.replace(new RegExp(`id="${oldId}"`, 'g'), `id="${newId}"`);
                processedSvg = processedSvg.replace(new RegExp(`url\\(#${oldId}\\)`, 'g'), `url(#${newId})`);
                processedSvg = processedSvg.replace(new RegExp(`xlink:href="#${oldId}"`, 'g'), `xlink:href="#${newId}"`);
                processedSvg = processedSvg.replace(new RegExp(`href="#${oldId}"`, 'g'), `href="#${newId}"`);
            }

            // 3. Get and set the primary-light color based on primary color
            setDynamicPrimaryLight();

            // 4. Apply color replacements from the mapping
            Object.entries(colorMapping).forEach(([originalColor, themeVariable]) => {
                // Skip gradient URLs (we handle them separately)
                if (originalColor.includes('url(#')) return;

                // Skip empty theme variables
                if (!themeVariable) return;

                // Skip numeric values that might be width/height attributes
                if (!isNaN(Number(originalColor))) return;

                // Create a case-insensitive regex for the color
                const colorRegex = new RegExp(originalColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

                // Replace the color with the theme variable
                processedSvg = processedSvg.replace(colorRegex, themeVariable);
            });

            // Special handling for text in error.svg
            if (svgUrl.includes('error.svg')) {
                // Make sure the text color stays white
                processedSvg = processedSvg.replace(/<text[^>]*?fill="[^"]*"[^>]*>/, match => {
                    return match.replace(/fill="[^"]*"/, 'fill="#ffffff"');
                });
            }

            // 5. Handle gradient stop colors explicitly
            processedSvg = processedSvg.replace(
                /stop-color="#e13975"/g,
                'stop-color="var(--primary-color)"'
            );

            processedSvg = processedSvg.replace(
                /stop-color="#6d1d50"/g,
                'stop-color="var(--secondary-color)"'
            );

            // 6. Make the SVG responsive with proper viewBox
            const viewBoxMatch = processedSvg.match(/viewBox="([^"]+)"/);
            const widthMatch = processedSvg.match(/width="([^"]+)"/);
            const heightMatch = processedSvg.match(/height="([^"]+)"/);

            // Add viewBox if missing
            if (!viewBoxMatch && widthMatch && heightMatch) {
                const w = widthMatch[1].replace(/[^0-9.]/g, '');
                const h = heightMatch[1].replace(/[^0-9.]/g, '');
                processedSvg = processedSvg.replace(/<svg/, `<svg viewBox="0 0 ${w} ${h}"`);
            }

            // Only set width and height for the root SVG element, not internal elements
            // First, save the original SVG string
            const originalSvg = processedSvg;

            // Replace only the first width and height (root SVG element)
            if (widthMatch) {
                processedSvg = processedSvg.replace(widthMatch[0], 'width="100%"');
            } else {
                processedSvg = processedSvg.replace(/<svg/, '<svg width="100%"');
            }

            if (heightMatch) {
                processedSvg = processedSvg.replace(heightMatch[0], 'height="100%"');
            } else {
                processedSvg = processedSvg.replace(/<svg/, '<svg height="100%"');
            }

            // Improve how we handle the preserveAspectRatio attribute
            // Use "xMidYMid meet" for error.svg to ensure it's fully visible
            if (svgUrl.includes('error.svg')) {
                if (!processedSvg.includes('preserveAspectRatio')) {
                    processedSvg = processedSvg.replace(
                        /<svg/,
                        '<svg preserveAspectRatio="xMidYMid meet"'
                    );
                } else {
                    processedSvg = processedSvg.replace(
                        /preserveAspectRatio="[^"]+"/,
                        'preserveAspectRatio="xMidYMid meet"'
                    );
                }
            } else {
                // Default behavior for other SVGs
                if (!processedSvg.includes('preserveAspectRatio')) {
                    processedSvg = processedSvg.replace(
                        /<svg/,
                        '<svg preserveAspectRatio="xMidYMid meet"'
                    );
                }
            }

            return processedSvg;

        } catch (error) {
            console.error("Error processing SVG:", error);
            return svgText; // Return original on error
        }
    };

    /**
     * Set the --primary-light CSS variable based on the --primary-color
     * This ensures the light color is always derived from the current primary color
     */
    const setDynamicPrimaryLight = () => {
        if (typeof window === 'undefined' || !document.documentElement) return;

        try {
            // Get the computed primary color
            const computedStyle = window.getComputedStyle(document.documentElement);
            let primaryColor = computedStyle.getPropertyValue('--primary-color').trim();

            // Set default if not found
            if (!primaryColor) primaryColor = '#e13975';

            // Create a lighter version
            const lightColor = createLighterColor(primaryColor);

            // Set the CSS variable
            document.documentElement.style.setProperty('--primary-light', lightColor);
        } catch (e) {
            console.error("Error setting primary-light:", e);
        }
    };

    /**
     * Creates a lighter version of a color
     */
    const createLighterColor = (color: string): string => {
        try {
            // Handle hex colors
            if (color.startsWith('#')) {
                let hex = color.replace('#', '');

                // Expand short hex (e.g., #F00 -> #FF0000)
                if (hex.length === 3) {
                    hex = hex.split('').map(c => c + c).join('');
                }

                // Convert to RGB
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);

                // Mix with white (80% white, 20% original)
                const lightness = 0.8;
                const newR = Math.round(r + (255 - r) * lightness);
                const newG = Math.round(g + (255 - g) * lightness);
                const newB = Math.round(b + (255 - b) * lightness);

                // Convert back to hex
                return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
            }

            // Handle rgb/rgba colors
            if (color.startsWith('rgb')) {
                const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                if (rgbMatch) {
                    const r = parseInt(rgbMatch[1], 10);
                    const g = parseInt(rgbMatch[2], 10);
                    const b = parseInt(rgbMatch[3], 10);

                    // Mix with white (80% white, 20% original)
                    const lightness = 0.8;
                    const newR = Math.round(r + (255 - r) * lightness);
                    const newG = Math.round(g + (255 - g) * lightness);
                    const newB = Math.round(b + (255 - b) * lightness);

                    return `rgb(${newR}, ${newG}, ${newB})`;
                }
            }

            // Default fallback
            return '#f7ccdd';
        } catch (e) {
            console.error("Error creating lighter color:", e);
            return '#f7ccdd'; // Fallback to light pink
        }
    };

    // Container style
    const containerStyle: CSSProperties = {
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "middle",
        width: width || "auto",
        height: height || "auto",
        background: "transparent" // Important for proper rendering
    };

    // For error.svg specifically, ensure we're not cutting off content
    if (svgUrl && svgUrl.includes('error.svg')) {
        // Special handling for error.svg
        containerStyle.overflow = "visible"; // Allow content to overflow
        containerStyle.display = "flex";
        containerStyle.justifyContent = "center";
        containerStyle.alignItems = "center";

        // If no explicit dimensions provided, use these defaults
        if (!width && !height) {
            containerStyle.width = "250px";
            containerStyle.height = "250px";
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div
                className={`${className || ""} bg-gray-100 animate-pulse`}
                style={containerStyle}
                aria-label={`Loading ${alt || "SVG"}`}
            />
        );
    }

    // Error state
    if (error) {
        return (
            <div
                className={`${className || ""} bg-gray-100 flex items-center justify-center text-gray-500`}
                style={containerStyle}
            >
                <span>SVG Error</span>
            </div>
        );
    }

    // Render SVG content
    if (svgContent) {
        return (
            <div
                className={className || ""}
                style={containerStyle}
                dangerouslySetInnerHTML={{ __html: svgContent }}
                aria-label={alt || "SVG Image"}
                role="img"
            />
        );
    }

    // Fallback
    return null;
};

export default ThemeSvg;