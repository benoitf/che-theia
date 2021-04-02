/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
import { V1alpha2DevWorkspace, V1alpha2DevWorkspaceTemplate } from '@devfile/api';

/**
 * Context used on every call to this service to resolve VSix components to add with their optional sidecar and the vsix installer
 */
export interface DevfileContext {
  // link to the devfile
  devfileUrl: string;

  // workspace namespace
  namespace: string;

  // devWorkspace
  devWorkspace: V1alpha2DevWorkspace;

  // devWorkspace templates
  devWorkspaceTemplates: V1alpha2DevWorkspaceTemplate[];
}
