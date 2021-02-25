/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import {
  Container,
  Endpoint,
  Workspace,
  WorkspaceService,
  WorkspaceSettings,
} from '@eclipse-che/theia-remote-api/lib/common/workspace-service';

import { injectable } from 'inversify';

// import { K8SServiceImpl } from './k8s-service-impl';

@injectable()
export class K8sWorkspaceServiceImpl implements WorkspaceService {
  /* @inject(K8SServiceImpl)
  private k8SService: K8SServiceImpl;
*/
  /**
   * workspaceId - workspace ID taken from environment variable, always the same at workspace lifecycle
   */
  private readonly workspaceId: string;

  /**
   * workspaceName - workspace name taken from environment variable, always the same at workspace lifecycle
   */
  private readonly workspaceName: string;

  /**
   * workspaceNamespace - workspace namespace taken from environment variable, always the same at workspace lifecycle
   */
  private readonly workspaceNamespace: string;

  constructor() {
    if (process.env.DEVWORKSPACE_ID === undefined) {
      console.error('Environment variable DEVWORKSPACE_ID is not set');
    } else {
      this.workspaceId = process.env.DEVWORKSPACE_ID;
    }
    if (process.env.DEVWORKSPACE_NAMESPACE === undefined) {
      console.error('Environment variable DEVWORKSPACE_NAMESPACE is not set');
    } else {
      this.workspaceNamespace = process.env.DEVWORKSPACE_NAMESPACE;
    }
    if (process.env.DEVWORKSPACE_NAME === undefined) {
      console.error('Environment variable DEVWORKSPACE_NAME is not set');
    } else {
      this.workspaceName = process.env.DEVWORKSPACE_NAME;
    }
  }

  public async getCurrentNamespace(): Promise<string> {
    return this.workspaceNamespace;
  }

  public async getCurrentWorkspaceId(): Promise<string> {
    return this.workspaceId;
  }

  public async currentWorkspace(): Promise<Workspace> {
    return {
      id: this.workspaceId,
      name: this.workspaceName,
      namespace: this.workspaceNamespace,
      // running as we're in the pod
      status: 'RUNNING',
    };
  }

  public async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    throw new Error('workspaceService.getWorkspaceById() not supported');
  }

  public async getAll(userToken?: string): Promise<Workspace[]> {
    throw new Error('workspaceService.getAll() not supported');
  }

  public async getAllByNamespace(namespace: string, userToken?: string): Promise<Workspace[]> {
    throw new Error(`workspaceService.getAllByNamespace(${namespace}) not supported`);
  }

  public async updateWorkspace(workspaceId: string, workspace: Workspace): Promise<Workspace> {
    throw new Error(`workspaceService.updateWorkspace(${workspaceId}) not supported`);
  }

  public async updateWorkspaceActivity(): Promise<void> {
    throw new Error('workpsaceService.updateWorkspaceActivity() not supported');
  }

  public async stop(): Promise<void> {
    // stopping the workspace is changing the state to false
    throw new Error('workpsaceService.stop() not supported');
  }

  public async getWorkspaceSettings(): Promise<WorkspaceSettings> {
    console.log('workspaceService.getWorkspaceSettings() not supported');
    return {};
  }

  public async getCurrentWorkspacesContainers(): Promise<{ [key: string]: Container }> {
    const result: { [key: string]: Container } = {};
    try {
      const workspace = await this.currentWorkspace();
      const containers = workspace.runtime!.machines;
      if (containers) {
        for (const containerName of Object.keys(containers)) {
          const container: Container = { name: containerName, ...containers[containerName] };
          container.name = containerName;
          if (container) {
            result[containerName] = container;
          }
        }
      }
    } catch (e) {
      throw new Error(`Unable to get workspace containers. Cause: ${e}`);
    }
    return result;
  }

  public async findUniqueEndpointByAttribute(attributeName: string, attributeValue: string): Promise<Endpoint> {
    const containers = await this.getCurrentWorkspacesContainers();
    try {
      if (containers) {
        for (const containerName of Object.keys(containers)) {
          const servers = containers[containerName].servers;
          if (servers) {
            for (const serverName of Object.keys(servers)) {
              const server = servers[serverName];
              if (server && server.attributes && server.attributes[attributeName] === attributeValue) {
                return server;
              }
            }
          }
        }
      }
      return Promise.reject(`Server by attributes '${attributeName}'='${attributeValue}' was not found.`);
    } catch (e) {
      return Promise.reject(`Unable to get workspace servers. Cause: ${e}`);
    }
  }

  public async getContainerList(): Promise<Container[]> {
    const containers: Container[] = [];
    try {
      const workspace = await this.currentWorkspace();

      if (workspace.runtime && workspace.runtime.machines) {
        const machines = workspace.runtime.machines;
        for (const machineName in machines) {
          if (!machines.hasOwnProperty(machineName)) {
            continue;
          }
          const machine = workspace.runtime.machines[machineName];
          const container: Container = { name: machineName, ...machine };
          containers.push(container);
        }
      }
    } catch (e) {
      throw new Error('Unable to get list workspace containers. Cause: ' + e);
    }

    return containers;
  }
}
