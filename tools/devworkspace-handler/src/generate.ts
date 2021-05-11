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

import * as fs from 'fs-extra';
import * as jsYaml from 'js-yaml';

import { V1alpha2DevWorkspace, V1alpha2DevWorkspaceTemplate, V1alpha2DevWorkspaceTemplateSpec } from '@devfile/api';
import { inject, injectable } from 'inversify';

import { DevfileCheTheiaPluginsResolver } from './devfile/devfile-che-theia-plugins-resolver';
import { GithubResolver } from './github/github-resolver';
import { PluginRegistryResolver } from './plugin-registry/plugin-registry-resolver';
import { UrlFetcher } from './fetch/url-fetcher';

@injectable()
export class Generate {
  @inject(GithubResolver)
  private githubResolver: GithubResolver;

  @inject(UrlFetcher)
  private urlFetcher: UrlFetcher;

  @inject(DevfileCheTheiaPluginsResolver)
  private devfileCheTheiaPluginsResolver: DevfileCheTheiaPluginsResolver;

  @inject(PluginRegistryResolver)
  private pluginRegistryResolver: PluginRegistryResolver;

  async generate(devfileUrl: string, outputFile: string): Promise<void> {
    const editorName = 'eclipse/che-theia/next';

    // devfile of the editor
    const editorDevfile = await this.pluginRegistryResolver.loadDevfilePlugin(editorName);

    // transform it into a devWorkspace template
    const metadata = editorDevfile.metadata;
    delete editorDevfile.metadata;
    delete editorDevfile.schemaVersion;
    const editorDevWorkspaceTemplate: V1alpha2DevWorkspaceTemplate = {
      apiVersion: 'workspace.devfile.io/v1alpha2',
      kind: 'DevWorkspaceTemplate',
      metadata,
      spec: editorDevfile as V1alpha2DevWorkspaceTemplateSpec,
    };

    // user devfile
    const devfileGithubUrl = this.githubResolver.resolve(devfileUrl);

    const userDevfileContent = await this.urlFetcher.fetchText(devfileGithubUrl.getContentUrl('devfile.yaml'));
    const devfile = jsYaml.load(userDevfileContent);

    // transform it into a devWorkspace
    const devfileMetadata = devfile.metadata;
    delete devfile.schemaVersion;
    delete devfile.metadata;
    const devWorkspace: V1alpha2DevWorkspace = {
      apiVersion: 'workspace.devfile.io/v1alpha2',
      kind: 'DevWorkspace',
      metadata: devfileMetadata,
      spec: {
        started: true,
        template: devfile,
      },
    };

    // for now the list of devWorkspace templates is only the editor template
    const devWorkspaceTemplates = [editorDevWorkspaceTemplate];

    await this.devfileCheTheiaPluginsResolver.handle({
      devfileUrl,
      devfile: userDevfileContent,
      devWorkspace,
      devWorkspaceTemplates,
      sidecarPolicy: 'useDevContainer',
    });

    // write templates and then DevWorkspace in a single file
    const allContentArray = devWorkspaceTemplates.map(template => jsYaml.dump(template));
    allContentArray.push(jsYaml.dump(devWorkspace));

    const generatedContent = allContentArray.join('---\n');

    await fs.writeFile(outputFile, generatedContent, 'utf-8');
  }
}
