/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import * as jsYaml from 'js-yaml';

import { inject, injectable, named } from 'inversify';

import { UrlFetcher } from '../fetch/url-fetcher';
import { VSCodeExtensionEntry } from '../api/vscode-extension-entry';

/**
 * FIXME: usage of meta.yaml is temporary until plugins are exposed in a different form on plugin-registry side
 */
interface MetaYaml {
  name: string;
  spec: {
    containers?: [
      {
        image: string;
        memoryLimit?: string;
      }
    ];
    extensions: string[];
  };
}

/**
 * Resolve plug-ins by grabbing the definition from the plug-in registry.
 */
@injectable()
export class PluginRegistryResolver {
  @inject('string')
  @named('PLUGIN_REGISTRY_URL')
  private pluginRegistryUrl: string;

  @inject(UrlFetcher)
  private urlfetcher: UrlFetcher;

  async resolve(vSCodeExtensionEntries: VSCodeExtensionEntry[]): Promise<void> {
    await Promise.all(vSCodeExtensionEntries.map(entry => this.resolveEntry(entry)));
  }

  // check if extension is not resolved
  // if not, reach plugin-registry
  async resolveEntry(vSCodeExtensionEntry: VSCodeExtensionEntry): Promise<void> {
    // skip already resolved
    if (vSCodeExtensionEntry.resolved === true) {
      return;
    }

    // grab the content from the plugin registry
    // plugin registry url is with the format "https://plugin-registry.com/v3"
    const url = `${this.pluginRegistryUrl}/plugins/${vSCodeExtensionEntry.id}/meta.yaml`;

    // let's propagate the error if the plugin definition does not exist
    const metaYamlContent = await this.urlfetcher.fetchTextOptionalContent(url);
    if (!metaYamlContent) {
      if (vSCodeExtensionEntry.optional === true) {
        console.error(
          `${vSCodeExtensionEntry.id} is missing on the plug-in registry but it is flagged as optional, skipping it`
        );
        return;
      } else {
        throw new Error(
          `${vSCodeExtensionEntry.id} is a mandatory plug-in but definition is not found on the plug-in registry. Aborting !`
        );
      }
    }
    const metaYaml: MetaYaml = jsYaml.load(metaYamlContent);

    // resolve now the extension
    vSCodeExtensionEntry.resolved = true;

    vSCodeExtensionEntry.extensions = metaYaml.spec.extensions;

    if (metaYaml.spec.containers && metaYaml.spec.containers.length > 0) {
      const firstContainer = metaYaml.spec.containers[0];
      vSCodeExtensionEntry.sidecar = {
        image: firstContainer.image,
      };
      if (firstContainer.memoryLimit) {
        vSCodeExtensionEntry.sidecar.memoryLimit = firstContainer.memoryLimit;
      }
    }
  }
}
