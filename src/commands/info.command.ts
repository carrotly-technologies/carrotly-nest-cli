import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager } from '../utils/config-manager';

export class InfoCommand {
  getCommand(): Command {
    const infoCommand = new Command('info');

    infoCommand
      .description('show information about the current Carrotly project')
      .option('-p, --path <path>', 'project path', '.')
      .action(async (options: { path: string }) => {
        try {
          await this.execute(options.path);
        } catch (error) {
          console.error(chalk.red('Error reading project info:'), error);
          process.exit(1);
        }
      });

    return infoCommand;
  }

  private async execute(projectPath: string): Promise<void> {
    console.log(chalk.cyan('🥕 Carrotly Project Information'));
    console.log();

    // Check if this is a Carrotly project
    const isCarrotlyProject =
      await ConfigManager.isCarrotlyProject(projectPath);

    if (!isCarrotlyProject) {
      console.log(
        chalk.yellow('⚠️  This directory does not contain a Carrotly project.'),
      );
      console.log(chalk.gray('   Run "carrotly new" to create a new project.'));
      return;
    }

    // Read configuration
    const config = await ConfigManager.readConfig(projectPath);

    if (!config) {
      console.log(chalk.red('❌ Could not read project configuration.'));
      return;
    }

    // Display configuration summary
    console.log(chalk.green('✅ Valid Carrotly project found'));
    console.log();
    console.log(ConfigManager.getConfigSummary(config));

    // Display generated modules if any
    if (config.generated.modules.length > 0) {
      console.log();
      console.log(chalk.cyan('Generated Modules:'));
      config.generated.modules.forEach((module) => {
        console.log(
          chalk.gray(
            `  • ${module.name} (${module.type}) - ${new Date(module.createdAt).toLocaleDateString()}`,
          ),
        );
      });
    }

    // Display generated files count
    console.log();
    console.log(
      chalk.gray(`Generated files: ${config.generated.files.length}`),
    );
    console.log(
      chalk.gray(
        `Last updated: ${new Date(config.generated.lastGenerated).toLocaleString()}`,
      ),
    );
    console.log(chalk.gray(`CLI version: ${config.cliVersion}`));
  }
}
