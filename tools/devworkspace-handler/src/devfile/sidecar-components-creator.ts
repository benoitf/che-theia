/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import { V1alpha2DevWorkspaceSpecTemplateComponents } from '@devfile/api';
import { VSCodeExtensionEntryWithSidecar } from '../api/vscode-extension-entry';
import { injectable } from 'inversify';

/**
 * Generate spec template components for every sidecar of plug-ins
 */
@injectable()
export class SidecarComponentsCreator {
  async create(
    extensionsWithSidecars: VSCodeExtensionEntryWithSidecar[]
  ): Promise<V1alpha2DevWorkspaceSpecTemplateComponents[]> {
    // ok now add sidecar components
    return extensionsWithSidecars.map(entry => {
      const sidecarName = `sidecar-${entry.id.replace(/[^\w\s]/gi, '-')}`;
      const attributes = {
        'app.kubernetes.io/part-of': 'che-theia.eclipse.org',
        'app.kubernetes.io/component': 'vscode-plugin',
        'che-theia.eclipse.org/vscode-extensions': entry.extensions,
      };
      const component = {
        name: sidecarName,
        attributes,
        container: entry.sidecar,
      };

      // add extra stuff

      // first, the env
      let env = component.container.env;
      if (!env) {
        env = [];
        component.container.env = env;
      }
      env.push({
        name: 'PLUGIN_REMOTE_ENDPOINT_EXECUTABLE',
        value: '/remote-endpoint/plugin-remote-endpoint',
      });
      env.push({
        name: 'THEIA_PLUGINS',
        value: `local-dir:///plugins/sidecars/${sidecarName}`,
      });

      // next, the volumes
      let volumeMounts = component.container.volumeMounts;
      if (!volumeMounts) {
        volumeMounts = [];
        component.container.volumeMounts = volumeMounts;
      }
      volumeMounts.push({
        path: '/remote-endpoint',
        name: 'remote-endpoint',
      });
      volumeMounts.push({
        path: '/plugins',
        name: 'plugins',
      });
      return component as V1alpha2DevWorkspaceSpecTemplateComponents;
    });
  }
}
