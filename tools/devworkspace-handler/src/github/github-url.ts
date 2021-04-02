/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

/**
 * Provides helper methods on top of github URL to get for example raw content of get relative links
 */
export class GithubUrl {
  // raw link
  // static readonly RAW_LINK = 'https://raw.githubusercontent.com';
  static readonly RAW_LINK = 'https://cdn.jsdelivr.net/gh';

  constructor(
    private readonly repoUser: string,
    private readonly repoName: string,
    private readonly branchName: string,
    private readonly subFolder: string
  ) {}

  /**
   * Provides the raw link to the given path based on the current repository information
   */
  getContentUrl(path: string) {
    return `${GithubUrl.RAW_LINK}/${this.repoUser}/${this.repoName}@${this.branchName}/${path}`;
  }

  getUrl(): string {
    return `https://github.com/${this.repoUser}/${this.repoName}/tree/${this.branchName}/${this.subFolder}`;
  }
}
