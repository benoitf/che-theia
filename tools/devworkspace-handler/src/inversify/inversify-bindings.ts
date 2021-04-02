/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import 'reflect-metadata';

import { AxiosInstance } from 'axios';
import { Container } from 'inversify';
import { cheTheiaModule } from '../che-theia/che-theia-module';
import { devfileModule } from '../devfile/devfile-module';
import { fetchModule } from '../fetch/fetch-module';
import { githubModule } from '../github/github-module';
import { registryModule } from '../registry/registry-module';
import { vscodeModule } from '../vscode/vscode-module';
import { vsixInstallerModule } from '../vsix-installer/vsix-installer-module';

interface InversifyBindingOptions {
  pluginRegistryUrl: string;
  axiosInstance: AxiosInstance;
  enableCors?: boolean;
}
/**
 * Manage all bindings for inversify
 */
export class InversifyBinding {
  private container: Container;

  public async initBindings(options: InversifyBindingOptions): Promise<Container> {
    this.container = new Container();
    this.container.load(cheTheiaModule);
    this.container.load(devfileModule);
    this.container.load(fetchModule);
    this.container.load(githubModule);
    this.container.load(registryModule);
    this.container.load(vscodeModule);
    this.container.load(vsixInstallerModule);

    this.container.bind(Symbol.for('AxiosInstance')).toConstantValue(options.axiosInstance);
    this.container.bind('string').toConstantValue(options.pluginRegistryUrl).whenTargetNamed('PLUGIN_REGISTRY_URL');
    return this.container;
  }
}
