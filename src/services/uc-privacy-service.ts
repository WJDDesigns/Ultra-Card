/**
 * Privacy Protection Service for Ultra Card Exports
 * Sanitizes sensitive information before sharing presets
 */

interface PrivacyRule {
  pattern: RegExp;
  replacement: string;
  description: string;
  category: 'ip' | 'personal' | 'location' | 'device' | 'network';
}

interface PrivacyScanResult {
  found: Array<{
    original: string;
    replacement: string;
    category: string;
    description: string;
    field: string;
  }>;
  sanitizedData: any;
}

class UcPrivacyService {
  private readonly privacyRules: PrivacyRule[] = [
    // IP Addresses in URLs and entity references (dots or underscores)
    {
      pattern:
        /(?:(?:192[\._]168|10[\._]|172[\._](?:1[6-9]|2[0-9]|3[01]))[\._]\d{1,3}[\._]\d{1,3}|\d{1,3}[\._]\d{1,3}[\._]\d{1,3}[\._]\d{1,3})/g,
      replacement: '192_168_1_100',
      description: 'IP addresses (with dots or underscores)',
      category: 'ip',
    },

    // MAC addresses
    {
      pattern:
        /\b[0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}\b/g,
      replacement: '00:11:22:33:44:55',
      description: 'MAC addresses',
      category: 'network',
    },
  ];

  /**
   * Context-aware privacy rules that only apply to specific field types
   */
  private readonly contextualPrivacyRules: Array<{
    rule: PrivacyRule;
    fieldPatterns: RegExp[];
  }> = [
    // Person entities - catch ANY person.* entity for complete safety
    {
      rule: {
        pattern: /\bperson\.[a-zA-Z0-9_]+/g,
        replacement: 'person.person',
        description: 'Person entity IDs (any name)',
        category: 'personal',
      },
      fieldPatterns: [/entity/i, /template/i, /name/i, /custom.*text/i],
    },

    // Personal names in other entity types - only in entity IDs and templates
    {
      rule: {
        pattern:
          /\b(device_tracker\.|sensor\.|switch\.|light\.|climate\.|binary_sensor\.|input_boolean\.|input_text\.|input_select\.)?(emily|emma|olivia|ava|sophia|isabella|charlotte|mia|amelia|harper|evelyn|abigail|ella|elizabeth|camila|luna|sofia|avery|mila|aria|scarlett|penelope|layla|chloe|victoria|madison|eleanor|grace|nora|riley|zoey|hannah|hazel|lily|ellie|violet|lillian|zoe|stella|aurora|natalie|emilia|evelyn|leah|aubrey|willow|addison|lucy|audrey|bella|nova|brooklyn|alice|jasmine|anna|liam|noah|oliver|elijah|william|james|benjamin|lucas|henry|alexander|mason|michael|ethan|daniel|jacob|logan|jackson|levi|sebastian|mateo|jack|owen|theodore|aiden|samuel|joseph|john|david|wyatt|matthew|luke|asher|carter|julian|grayson|leo|jayden|gabriel|isaac|lincoln|anthony|hudson|dylan|ezra|thomas|charles|christopher|jaxon|maverick|josiah|isaiah|andrew|elias|joshua|nathan|caleb|ryan|adrian|miles|eli|nolan|christian|aaron|cameron|ezekiel|colton|luca|landon|hunter|jonathan|santiago|axel|easton|cooper|jeremiah|angel|roman|connor|jameson|robert|greyson|jordan|ian|carson|jaxson|leonardo|nicholas|dominic|austin|everett|brooks|xavier|kai|jose|parker|adam|jace|wesley|kayden|silas)(_\w+)?\b/gi,
        replacement: 'person',
        description: 'Personal names in non-person entity IDs',
        category: 'personal',
      },
      fieldPatterns: [/entity/i, /template/i, /name/i, /custom.*text/i],
    },

    // Room/Location identifiers - only in entity IDs and templates
    {
      rule: {
        pattern:
          /\b(sensor\.|switch\.|light\.|climate\.|binary_sensor\.)?(master_bedroom|kids_room|bedroom|kitchen|bathroom|garage|basement|attic|office|nursery|playroom|den|study|workshop|shed|patio|deck|porch|driveway|backyard|frontyard|living_room|dining_room|family_room|guest_room|laundry_room|utility_room|pantry|closet|hallway|stairway|foyer|entryway|mudroom)(_\w+)?\b/gi,
        replacement: 'room',
        description: 'Room/location identifiers',
        category: 'location',
      },
      fieldPatterns: [/entity/i, /template/i, /name/i, /custom.*text/i],
    },

    // Personal device names - only in entity IDs and device trackers
    {
      rule: {
        pattern:
          /\b(device_tracker\.|sensor\.)?(\w*)(phone|ipad|tablet|laptop|desktop|macbook|iphone|android|samsung|pixel|watch|airpods|headphones)(\w*)\b/gi,
        replacement: 'device',
        description: 'Personal device identifiers',
        category: 'device',
      },
      fieldPatterns: [/entity/i, /template/i, /device/i, /tracker/i],
    },

    // Network device identifiers - only in entity IDs
    {
      rule: {
        pattern:
          /\b(sensor\.|switch\.|device_tracker\.)?(wifi|network|router|modem|access_point|ap)(_\w+)?\b/gi,
        replacement: 'network_device',
        description: 'Network device identifiers',
        category: 'network',
      },
      fieldPatterns: [/entity/i, /template/i, /network/i],
    },

    // Vehicle identifiers - only in entity IDs (excluding 'auto' to avoid CSS conflicts)
    {
      rule: {
        pattern:
          /\b(device_tracker\.|sensor\.)?(car|vehicle|truck|suv|van|motorcycle|bike|tesla|bmw|audi|honda|toyota|ford|chevy|chevrolet|nissan|hyundai|kia|mazda|subaru|volkswagen|vw|volvo|mercedes|benz|lexus|acura|infiniti|cadillac|buick|gmc|jeep|ram|dodge|chrysler|fiat|mini|porsche|ferrari|lamborghini|maserati|jaguar|land_rover|range_rover)(_\w+)?\b/gi,
        replacement: 'vehicle',
        description: 'Vehicle identifiers',
        category: 'device',
      },
      fieldPatterns: [/entity/i, /template/i, /vehicle/i, /car/i, /tracker/i],
    },

    // Street addresses - only in address or location fields
    {
      rule: {
        pattern:
          /\b\d{1,5}\s+[A-Za-z\s]+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|place|pl|way|circle|cir|boulevard|blvd)\b/gi,
        replacement: '123 Main Street',
        description: 'Street addresses',
        category: 'location',
      },
      fieldPatterns: [/address/i, /location/i, /street/i, /template/i],
    },
  ];

  /**
   * Scan data for privacy issues and return sanitized version
   */
  scanAndSanitize(data: any, dataPath = ''): PrivacyScanResult {
    const found: PrivacyScanResult['found'] = [];
    const sanitizedData = this._deepSanitize(JSON.parse(JSON.stringify(data)), found, dataPath);

    return { found, sanitizedData };
  }

  /**
   * Deep sanitize an object recursively
   */
  private _deepSanitize(obj: any, found: PrivacyScanResult['found'], path: string): any {
    if (typeof obj === 'string') {
      return this._sanitizeString(obj, found, path);
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) => this._deepSanitize(item, found, `${path}[${index}]`));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = path ? `${path}.${key}` : key;
        sanitized[key] = this._deepSanitize(value, found, fieldPath);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitize a string value with context awareness
   */
  private _sanitizeString(str: string, found: PrivacyScanResult['found'], field: string): string {
    let sanitized = str;

    // Apply universal rules (IP addresses, MAC addresses)
    for (const rule of this.privacyRules) {
      const matches = str.match(rule.pattern);
      if (matches) {
        for (const match of matches) {
          const existing = found.find(f => f.original === match && f.field === field);
          if (!existing) {
            found.push({
              original: match,
              replacement: rule.replacement,
              category: rule.category,
              description: rule.description,
              field,
            });
          }
        }
        sanitized = sanitized.replace(rule.pattern, rule.replacement);
      }
    }

    // Apply contextual rules only if field matches expected patterns
    for (const contextualRule of this.contextualPrivacyRules) {
      const isRelevantField = contextualRule.fieldPatterns.some(pattern => pattern.test(field));

      if (isRelevantField) {
        const matches = str.match(contextualRule.rule.pattern);
        if (matches) {
          for (const match of matches) {
            const existing = found.find(f => f.original === match && f.field === field);
            if (!existing) {
              found.push({
                original: match,
                replacement: contextualRule.rule.replacement,
                category: contextualRule.rule.category,
                description: contextualRule.rule.description,
                field,
              });
            }
          }
          sanitized = sanitized.replace(
            contextualRule.rule.pattern,
            contextualRule.rule.replacement
          );
        }
      }
    }

    return sanitized;
  }

  /**
   * Show privacy confirmation dialog (deprecated - now automatic)
   */
  async showPrivacyDialog(scanResult: PrivacyScanResult): Promise<boolean> {
    // Always return true - privacy protection is now automatic
    // Log what was sanitized for debugging if needed
    if (scanResult.found.length > 0) {
      console.log(
        `🔒 Privacy Protection: Automatically sanitized ${scanResult.found.length} items`
      );
    }
    return true;
  }

  /**
   * Generate privacy warning message for console/toast
   */
  generateWarningMessage(scanResult: PrivacyScanResult): string {
    if (scanResult.found.length === 0) {
      return 'No sensitive information detected. Safe to export!';
    }

    const categories = [...new Set(scanResult.found.map(f => f.category))];
    const categoryNames = {
      ip: 'IP addresses',
      personal: 'Personal names',
      location: 'Location info',
      device: 'Device names',
      network: 'Network info',
    };

    const foundCategories = categories.map(cat => categoryNames[cat]).join(', ');
    const itemCount = scanResult.found.length;

    return `🔒 Privacy Protection: Found ${itemCount} sensitive item${itemCount > 1 ? 's' : ''} (${foundCategories}) that will be replaced with generic placeholders.`;
  }

  /**
   * Generate detailed privacy report for debugging
   */
  generateDetailedReport(scanResult: PrivacyScanResult): string {
    if (scanResult.found.length === 0) {
      return '✅ No sensitive information found - safe to export!';
    }

    const grouped = scanResult.found.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, typeof scanResult.found>
    );

    let report = '🔒 Privacy Protection Report:\n\n';

    for (const [category, items] of Object.entries(grouped)) {
      const categoryIcons = {
        ip: '🌐',
        personal: '👤',
        location: '📍',
        device: '📱',
        network: '🔗',
      };

      report += `${categoryIcons[category as keyof typeof categoryIcons]} ${items[0].description}:\n`;

      items.forEach(item => {
        report += `  "${item.original}" → "${item.replacement}" (in ${item.field})\n`;
      });

      report += '\n';
    }

    return report;
  }

  private _generateDialogMessage(scanResult: PrivacyScanResult): string {
    const itemCount = scanResult.found.length;
    let message = `🔒 PRIVACY PROTECTION\n\n`;
    message += `Found ${itemCount} potentially sensitive item${itemCount > 1 ? 's' : ''} that will be replaced:\n\n`;

    // Group by category
    const grouped = scanResult.found.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, typeof scanResult.found>
    );

    for (const [category, items] of Object.entries(grouped)) {
      const icons = { ip: '🌐', personal: '👤', location: '📍', device: '📱', network: '🔗' };
      message += `${icons[category as keyof typeof icons]} ${items[0].description}:\n`;

      // Show up to 3 examples
      items.slice(0, 3).forEach(item => {
        message += `  "${item.original}" → "${item.replacement}"\n`;
      });

      if (items.length > 3) {
        message += `  ... and ${items.length - 3} more\n`;
      }
      message += '\n';
    }

    message += 'This protects your privacy when sharing presets.\n\n';
    message += 'Continue with export?';

    return message;
  }
}

export const ucPrivacyService = new UcPrivacyService();
