const fs = require('fs');
const path = require('path');

const mdPath = path.resolve(__dirname, '../../PLACES.md');
const tsPath = path.resolve(__dirname, '../src/data/places.ts');

try {
  if (!fs.existsSync(mdPath)) {
    console.error(`Error: PLACES.md not found at ${mdPath}`);
    process.exit(1);
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  
  // Split by "### " to separate place entries (ignoring the intro section before the first place)
  const blocks = mdContent.split(/\n###\s+/);
  
  const places = [];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const lines = block.split('\n');
    const nameWithNumber = lines[0].trim();
    
    // Clean up name if it has a numbering prefix like "1. Name"
    const name = nameWithNumber.replace(/^\d+\.\s*/, '');
    
    const place = { name };

    for (let j = 1; j < lines.length; j++) {
      const line = lines[j].trim();
      if (!line) continue;

      // Match properties like "- **key**: value"
      const match = line.match(/^-\s+\*\*([a-zA-Z0-9_]+)\*\*:\s*(.*)/);
      if (match) {
        const key = match[1];
        const val = match[2].trim();

        if (key === 'tags' || key === 'recommendedItems') {
          // Parse comma-separated array strings, removing surrounding quotes or brackets if present
          let cleanVal = val.replace(/^\[|\]$/g, '');
          place[key] = cleanVal ? cleanVal.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')) : [];
        } else if (key === 'latitude' || key === 'longitude') {
          place[key] = parseFloat(val);
        } else if (key === 'priceLevel') {
          place[key] = parseInt(val, 10);
        } else {
          // Clean up string values (strip wrapping quotes if they were added)
          place[key] = val.replace(/^['"]|['"]$/g, '');
        }
      }
    }

    // Only add valid place structures
    if (place.id && place.category && place.latitude && place.longitude) {
      places.push(place);
    } else {
      console.warn(`Warning: Skipped block "${name}" due to missing required fields (id, category, latitude, longitude).`);
    }
  }

  // Generate type-safe typescript source file
  const codeContent = `import { Place } from "@/types/place";

export const PLACES: Place[] = ${JSON.stringify(places, null, 2)};
`;

  let existingContent = '';
  if (fs.existsSync(tsPath)) {
    existingContent = fs.readFileSync(tsPath, 'utf8');
  }

  if (existingContent !== codeContent) {
    fs.writeFileSync(tsPath, codeContent, 'utf8');
    console.log(`Successfully compiled ${places.length} places from PLACES.md to ${tsPath}`);
  } else {
    // Skip writing to prevent watcher trigger loops
  }
} catch (error) {
  console.error("Failed to parse PLACES.md:", error);
  process.exit(1);
}
