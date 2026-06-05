'use client';

import { useMemo } from 'react';

interface PreviewProps {
  cssContent: string;
  htmlContent: string;
  jsContent: string;
}

export default function Preview({ cssContent, htmlContent, jsContent }: PreviewProps) {
  const srcDoc = useMemo(() => {
    // Escapar contenido especial
    const escapedJs = (jsContent || '')
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  width: 100%;
  height: 100%;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background: white;
  color: #333;
}
${cssContent}
</style>
</head>
<body>
${htmlContent}
<script type="text/javascript">
(function() {
  try {
    eval(\`${escapedJs}\`);
  } catch(e) {
    console.error('Script error:', e);
  }
})();
</script>
</body>
</html>`;
  }, [cssContent, htmlContent, jsContent]);

  return (
    <iframe
      className="w-full h-full border-0"
      title="Script Preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: 'white'
      }}
    />
  );
}
