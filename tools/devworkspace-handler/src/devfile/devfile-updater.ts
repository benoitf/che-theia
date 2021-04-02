/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import { inject, injectable } from 'inversify';

import { CheTheiaComponentUpdater } from './che-theia-component-updater';
import { DevfileContext } from '../api/devfile-context';
import { SidecarComponentsCreator } from './sidecar-components-creator';
import { VSCodeExtensionEntryWithSidecar } from '../api/vscode-extension-entry';
import { VsixInstallerComponentUpdater } from '../vsix-installer/vsix-installer-component-updater';

/**
 * This class is responsible to:
 *  - add annotations about vsix files to add on che-theia component
 *  - add sidecar components + their vsix files
 *  - add vsix installer component
 */
@injectable()
export class DevfileUpdater {
  @inject(SidecarComponentsCreator)
  private sidecarComponentsCreator: SidecarComponentsCreator;

  @inject(CheTheiaComponentUpdater)
  private cheTheiaComponentUpdater: CheTheiaComponentUpdater;

  @inject(VsixInstallerComponentUpdater)
  private vsixInstallerComponentUpdater: VsixInstallerComponentUpdater;

  async update(
    devfileContext: DevfileContext,
    cheTheiaVsix: string[],
    extensionsWithSidecars: VSCodeExtensionEntryWithSidecar[]
  ): Promise<void> {
    if (!devfileContext.devWorkspace.spec?.template?.components) {
      throw new Error('Can update a dev workspace only if there is a template with components in spec object');
    }

    // first, update theia component to add the vsix URLS
    this.cheTheiaComponentUpdater.insertVsix(devfileContext, cheTheiaVsix);

    // then, generate sidecar components to add
    const componentsToAdd = await this.sidecarComponentsCreator.create(extensionsWithSidecars);
    // and add them
    devfileContext.devWorkspace.spec.template.components.push(...componentsToAdd);

    // finally add the vsix installer
    this.vsixInstallerComponentUpdater.add(devfileContext);
  }
}
