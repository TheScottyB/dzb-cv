import { Command } from 'commander';
import chalk from 'chalk';
import configService from '../../core/services/config/ConfigurationService';

/**
 * Configuration management command
 */
export function createConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('Manage CV generation configuration');

  // Initialize configuration
  configCmd
    .command('init')
    .description('Initialize configuration with defaults')
    .action(async () => {
      try {
        await configService.load();
        await configService.initialize();
        console.log(chalk.green('✅ Configuration initialized successfully'));
      } catch (error) {
        console.error(chalk.red('❌ Failed to initialize configuration:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Show current configuration
  configCmd
    .command('show')
    .description('Display current configuration')
    .option('--ai', 'Show only AI configuration')
    .option('--app', 'Show only app configuration')
    .option('--pdf', 'Show only PDF configuration')
    .action(async (options) => {
      try {
        await configService.load();
        const config = configService.get();

        if (options.ai) {
          console.log(chalk.blue('🤖 AI Configuration:'));
          console.log(JSON.stringify(config.ai, null, 2));
        } else if (options.app) {
          console.log(chalk.blue('📱 App Configuration:'));
          console.log(JSON.stringify(config.app, null, 2));
        } else if (options.pdf) {
          console.log(chalk.blue('📄 PDF Configuration:'));
          console.log(JSON.stringify(config.pdf, null, 2));
        } else {
          console.log(chalk.blue('📋 Current Configuration:'));
          console.log(JSON.stringify(config, null, 2));
        }
      } catch (error) {
        console.error(chalk.red('❌ Failed to load configuration:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Validate OpenAI setup
  configCmd
    .command('validate-ai')
    .description('Validate OpenAI API configuration')
    .action(async () => {
      try {
        await configService.load();
        const validation = configService.validateOpenAI();
        
        if (validation.valid) {
          console.log(chalk.green('✅ OpenAI configuration is valid'));
          console.log(chalk.blue('💡', validation.message));
        } else {
          console.log(chalk.yellow('⚠️  OpenAI configuration issues detected'));
          console.log(chalk.red('❌', validation.message));
          console.log();
          console.log(chalk.blue('💡 To fix this:'));
          console.log('   1. Get an API key from: https://platform.openai.com/api-keys');
          console.log('   2. Set environment variable: export OPENAI_API_KEY=your-key-here');
          console.log('   3. Or update configuration file with: dzb-cv config set ai.openai.apiKey your-key-here');
        }
      } catch (error) {
        console.error(chalk.red('❌ Failed to validate AI configuration:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Set configuration value
  configCmd
    .command('set <key> <value>')
    .description('Set a configuration value (e.g., ai.defaultStyle professional)')
    .action(async (key: string, value: string) => {
      try {
        await configService.load();
        
        // Parse the value (handle booleans and numbers)
        let parsedValue: any = value;
        if (value.toLowerCase() === 'true') parsedValue = true;
        else if (value.toLowerCase() === 'false') parsedValue = false;
        else if (!isNaN(Number(value))) parsedValue = Number(value);

        // Set the configuration value using dot notation
        const config = configService.get();
        setNestedValue(config, key, parsedValue);
        
        // Update the service with the modified config
        if (key.startsWith('ai.')) {
          configService.updateAI(config.ai);
        } else if (key.startsWith('app.')) {
          configService.updateApp(config.app);
        } else if (key.startsWith('pdf.')) {
          configService.updatePDF(config.pdf);
        }

        await configService.save();
        console.log(chalk.green(`✅ Configuration updated: ${key} = ${parsedValue}`));
      } catch (error) {
        console.error(chalk.red('❌ Failed to set configuration:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Get configuration value
  configCmd
    .command('get <key>')
    .description('Get a configuration value (e.g., ai.defaultStyle)')
    .action(async (key: string) => {
      try {
        await configService.load();
        const config = configService.get();
        const value = getNestedValue(config, key);
        
        if (value !== undefined) {
          console.log(chalk.blue(`${key}:`), JSON.stringify(value, null, 2));
        } else {
          console.log(chalk.yellow(`⚠️  Configuration key '${key}' not found`));
        }
      } catch (error) {
        console.error(chalk.red('❌ Failed to get configuration:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Reset configuration to defaults
  configCmd
    .command('reset')
    .description('Reset configuration to defaults')
    .option('--confirm', 'Skip confirmation prompt')
    .action(async (options) => {
      try {
        if (!options.confirm) {
          console.log(chalk.yellow('⚠️  This will reset all configuration to defaults.'));
          console.log(chalk.blue('💡 Run with --confirm to proceed.'));
          return;
        }

        // Reset by creating a new service instance with defaults
        await configService.load(); // Load defaults
        await configService.save();
        
        console.log(chalk.green('✅ Configuration reset to defaults'));
      } catch (error) {
        console.error(chalk.red('❌ Failed to reset configuration:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}

/**
 * Set nested value using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Get nested value using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
