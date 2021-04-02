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

import { CheTheiaComponentFinder } from './che-theia-component-finder';
import { DevfileContext } from '../api/devfile-context';

@injectable()
export class CheTheiaComponentUpdater {
  @inject(CheTheiaComponentFinder)
  private cheTheiaComponentFinder: CheTheiaComponentFinder;

  async insertVsix(devfileContext: DevfileContext, cheTheiaVsix: string[]): Promise<void> {
    const theiaComponent = await this.cheTheiaComponentFinder.find(devfileContext);

    // add attributes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let attributes: any = theiaComponent.attributes;
    if (!attributes) {
      attributes = {};
      theiaComponent.attributes = attributes;
    }
    attributes['che-theia.eclipse.org/vscode-extensions'] = cheTheiaVsix;
  }
}
