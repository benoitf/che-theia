/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import * as jsoncparser from 'jsonc-parser';

import { VSCodeExtensionEntry } from '../api/vscode-extension-entry';
import { injectable } from 'inversify';

@injectable()
export class VscodeExtensionJsonAnalyzer {
  async extractPlugins(vscodeExtensionsJsonContent: string): Promise<VSCodeExtensionEntry[]> {
    // use of JSONC parser as we have comments in the VS code json file
    const strippedContent = jsoncparser.stripComments(vscodeExtensionsJsonContent);
    const vscodeExtensionsJson = jsoncparser.parse(strippedContent);

    if (!vscodeExtensionsJson.recommendations || !vscodeExtensionsJson.recommendations.length) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return vscodeExtensionsJson.recommendations.map((recommendation: string) => ({
      id: `${recommendation.replace(/\./g, '/')}/latest`,
      resolved: false,
      optional: true,
      extensions: [],
    }));
  }
}
