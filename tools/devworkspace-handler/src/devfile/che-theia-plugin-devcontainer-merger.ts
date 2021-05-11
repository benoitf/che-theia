/**********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import { VSCodeExtensionDevContainer } from './vscode-extension-dev-container';
import { VSCodeExtensionEntryWithSidecar } from '../api/vscode-extension-entry';
import { injectable } from 'inversify';

/**
 * Grab information that needs to be added on dev container
 */
@injectable()
export class CheTheiaPluginDevContainerMerger {
  merge(extensionsWithSidecars: VSCodeExtensionEntryWithSidecar[]): VSCodeExtensionDevContainer {
    const extensions = extensionsWithSidecars
      .map(extension => extension.extensions)
      // flatten the array of array
      .reduce((acc, val) => acc.concat(val), []);

    // merge preferences
    const allPreferences = extensionsWithSidecars
      .map(extension => extension.preferences || {})
      .reduce((acc, val) => acc.concat(val), []);
    const preferences = Object.assign({}, ...allPreferences);

    // all volume Mounts
    const volumeMounts = extensionsWithSidecars
      .map(extension => extension.sidecar.volumeMounts || [])
      .reduce((acc, val) => acc.concat(val), []);

    // all volume Mounts
    const endpoints = extensionsWithSidecars
      .map(extension => extension.sidecar.endpoints || [])
      .reduce((acc, val) => acc.concat(val), []);

    return {
      extensions,
      preferences,
      volumeMounts,
      endpoints,
    };
  }
}
