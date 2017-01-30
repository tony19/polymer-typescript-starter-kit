/*!
 * Copyright (c) 2017, Anthony Trinh
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as gulp from 'gulp';
import * as path from 'path';
import * as polymer from 'polymer-build';

export class HtmlSplitter {
  root?: string;
  filename: string;
  project: polymer.PolymerProject;

  constructor(root?: string) {
    this.root = root || '.';
  }

  /**
   * Splits an HTML file into CSS, JS, and HTML streams
   * @param filename path to HTML file
   * @returns stream
   */
  split(filename: string): NodeJS.ReadWriteStream {
    const projectConfig = {
      root: this.root,
      sources: [filename],
    };
    this.filename = filename;
    this.project = new polymer.PolymerProject(projectConfig);
    return gulp.src(filename).pipe(this.project.splitHtml());
  }

  /**
   * Rejoins split streams into HTML file
   * @param dest path to destination directory
   * @returns stream
   */
  rejoin(dest: string): NodeJS.ReadWriteStream {
    const stream = this.project.rejoinHtml();
    // FIXME: polymer-build's bundler is broken
    // https://github.com/Polymer/polymer-build/issues/110
    // stream.pipe(this.project.bundler);
    stream.pipe(gulp.dest(path.join(dest, this.filename, '..')));
    return stream;
  }
}
