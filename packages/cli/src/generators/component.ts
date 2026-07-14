import {
  toPascalCase,
  toSnakeCase,
  type AddComponentOptions,
  type ComponentKind,
  type GeneratorContext,
  type StackChainConfig,
  type TemplateFile,
  type TemplateLayer,
} from '@evenlogix/stackchain-shared';
import { GeneratorEngine } from '@evenlogix/stackchain-engine';
import { configToVariables } from '../config/load-config.js';

function featureRoot(architecture: string, feature: string): string {
  const name = toSnakeCase(feature);
  switch (architecture) {
    case 'mvvm':
      return `lib`;
    case 'mvc':
      return `lib`;
    case 'clean':
    case 'feature-first':
    default:
      return `lib/features/${name}`;
  }
}

function pathFor(kind: ComponentKind, name: string, architecture: string, feature: string): string {
  const snake = toSnakeCase(name);
  const featureName = toSnakeCase(feature);
  const root = featureRoot(architecture, featureName);

  switch (kind) {
    case 'feature':
      return `${root}/.gitkeep`;
    case 'screen':
      if (architecture === 'mvvm') return `lib/views/${snake}_view.dart`;
      if (architecture === 'mvc') return `lib/views/${snake}_view.dart`;
      return `${root}/presentation/pages/${snake}_page.dart`;
    case 'widget':
      if (architecture === 'mvvm' || architecture === 'mvc') {
        return `lib/views/widgets/${snake}.dart`;
      }
      return `${root}/presentation/widgets/${snake}.dart`;
    case 'model':
      if (architecture === 'mvvm' || architecture === 'mvc') {
        return `lib/models/${snake}.dart`;
      }
      return `${root}/data/models/${snake}_model.dart`;
    case 'repository':
      if (architecture === 'clean' || architecture === 'feature-first') {
        return `${root}/domain/repositories/${snake}_repository.dart`;
      }
      return `${root}/data/${snake}_repository.dart`;
    case 'datasource':
      return `${root}/data/datasources/${snake}.dart`;
    case 'usecase':
      return `${root}/domain/usecases/${snake}_usecase.dart`;
    case 'service':
      return `lib/core/services/${snake}_service.dart`;
    default:
      return `${root}/${snake}.dart`;
  }
}

function contentFor(kind: ComponentKind, name: string, projectName: string): string {
  const pascal = toPascalCase(name);
  const snake = toSnakeCase(name);

  switch (kind) {
    case 'feature':
      return `/// Feature: ${pascal}\nlibrary;\n`;
    case 'screen':
      return `import 'package:flutter/material.dart';

class ${pascal}Page extends StatelessWidget {
  const ${pascal}Page({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${pascal}')),
      body: const Center(child: Text('${pascal}')),
    );
  }
}
`;
    case 'widget':
      return `import 'package:flutter/material.dart';

class ${pascal} extends StatelessWidget {
  const ${pascal}({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
`;
    case 'model':
      return `import 'package:equatable/equatable.dart';

class ${pascal}Model extends Equatable {
  const ${pascal}Model({required this.id});

  final String id;

  factory ${pascal}Model.fromJson(Map<String, dynamic> json) {
    return ${pascal}Model(id: json['id'] as String);
  }

  Map<String, dynamic> toJson() => {'id': id};

  @override
  List<Object?> get props => [id];
}
`;
    case 'repository':
      return `abstract class ${pascal}Repository {
  // Define repository contracts here.
}
`;
    case 'datasource':
      return `abstract class ${pascal} {
  // Implement remote/local data access here.
}

class ${pascal}Impl implements ${pascal} {}
`;
    case 'usecase':
      return `class ${pascal}UseCase {
  ${pascal}UseCase();

  Future<void> call() async {
    // Implement use case logic.
  }
}
`;
    case 'service':
      return `class ${pascal}Service {
  ${pascal}Service();

  Future<void> initialize() async {}
}
`;
    default:
      return `// ${snake} for ${projectName}\n`;
  }
}

export class ComponentGenerator {
  private readonly engine = new GeneratorEngine();

  async add(
    options: AddComponentOptions,
    config: StackChainConfig,
    projectRoot: string,
  ): Promise<{ written: string[] }> {
    const feature = options.feature ?? 'authentication';
    const architecture = String(config.architecture);

    const files: TemplateFile[] = [];

    if (options.kind === 'feature') {
      const root = featureRoot(architecture, options.name);
      const dirs =
        architecture === 'mvvm'
          ? ['models', 'views', 'viewmodels']
          : architecture === 'mvc'
            ? ['models', 'views', 'controllers']
            : ['data', 'domain', 'presentation'];

      if (architecture === 'mvvm' || architecture === 'mvc') {
        files.push({
          path: `lib/features/${toSnakeCase(options.name)}/.gitkeep`,
          content: `/// Feature marker: ${toPascalCase(options.name)}\n`,
        });
      } else {
        for (const dir of dirs) {
          files.push({
            path: `${root}/${dir}/.gitkeep`,
            content: '',
          });
        }
        files.push({
          path: `${root}/${toSnakeCase(options.name)}.dart`,
          content: contentFor('feature', options.name, config.project.name),
        });
      }
    } else {
      files.push({
        path: pathFor(options.kind, options.name, architecture, feature),
        content: contentFor(options.kind, options.name, config.project.name),
      });
    }

    const layer: TemplateLayer = {
      id: `add-${options.kind}`,
      kind: 'feature',
      files,
    };

    const context: GeneratorContext = {
      projectRoot,
      config,
      variables: {
        ...configToVariables(config),
        name: toSnakeCase(options.name),
        name_pascal: toPascalCase(options.name),
        feature: toSnakeCase(feature),
      },
    };

    const plan = this.engine.compose([layer]);
    const result = await this.engine.apply(plan, context);
    return { written: result.written };
  }
}
