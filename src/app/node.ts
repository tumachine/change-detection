import { deepClone, randomInt } from './utils';
import { TreeNodeValue } from './node.service';

export class TreeNode<T> {
  parent: this | null = null;
  children: this[] = [];
  path: number[] = [];
  value!: T;

  defaultValue = {} as T;

  deepCloneValueFunc(val: T): T {
    return deepClone(val);
  }

  onValueChange(val: T): void {
    return;
  }

  onChildrenChange(val: T, children: this[]): void {
    return;
  }

  setup(parent: this | null = null, value: T | null = null, children: this[] = [], path: number[] = []): void {
    this.parent = parent;
    this.children = children;
    this.path = path;

    if (this.deepCloneValueFunc) {
      this.value = value ? this.deepCloneValueFunc(value) : this.deepCloneValueFunc(this.defaultValue);
    } else {
      this.value = value ? value : this.defaultValue;
    }

    this.onValueChange(this.value);
    this.onChildrenChange(this.value, this.children);
  }

  getDepth(): number {
    const depthsGatherer: number[] = [];
    this.getNodeDepths(this, depthsGatherer);
    return Math.max(...depthsGatherer);
  }

  addChild(child: this, index: number | null = null): void {
    child.parent = this;
    if (index) {
      this.children.splice(index, 0, child);
      child.path = this.createNodePath(index);
      this.nameChildren(this, index);
    } else {
      this.children.push(child);
      child.path = this.createNodePath(this.children.length - 1);
    }
    this.onChildrenChange(this.value, this.children);
  }

  createNode(parent: this | null = null, value: T | null = null, children: this[] = [], path: number[] = []): this {
    const node = new (<any> this.constructor)() as this;
    node.setup(parent, value, children, path);
    return node;
  }

  generateNodes(depth: number, childrenNum: number, child: this = this): void {
    if (depth <= 1) {
      return;
    }
    for (let i = 0; i < childrenNum; i++) {
      const newChild = this.createNode(null, this.deepCloneValueFunc(this.defaultValue), [], []);
      child.addChild(newChild);
    }

    child.children.forEach(n => this.generateNodes(depth - 1, childrenNum, n));
  }

  removeChild(child: this): void {
    const childIndex = child.path[child.path.length - 1];
    this.children.splice(childIndex, 1);
    this.nameChildren();
    this.onChildrenChange(this.value, this.children);
  }

  copy(): this {
    return this.copyNodeRecursive(this, this.copyNode(this));
  }

  countNodes(): number {
    let amount = 1;
    this.walkOverChildren(() => {
      amount += 1;
      return false;
    });
    return amount;
  }

  getRandomNode(): this {
    const randomNodeNum = randomInt(0, this.countNodes());
    if (randomNodeNum === 0) {
      return this;
    }

    let counter = 0;
    let randomNode = this.createNode(null, this.deepCloneValueFunc(this.defaultValue), [], []);
    this.walkOverChildren(n => {
      counter++;
      if (counter === randomNodeNum) {
        randomNode = n;
        return true;
      }
      return false;
    });
    return randomNode;
  }

  changeValue(val: Partial<T>): void {
    this.value = { ...this.value, ...val };
    this.onValueChange(this.value);
  }

  private copyNode(node: this): this {
    return this.createNode(node, this.deepCloneValueFunc(node.value) , [], [...node.path ]);
  }

  private copyNodeRecursive(real: this, copy: this): this {
    real.children.forEach(n => this.copyNodeRecursive(n, this.copyNode(n)));
    return copy;
  }

  private getNodeDepths(node: this, depthsGatherer: number[], depthCounter = 1): void {
    if (node.children.length === 0) {
      depthsGatherer.push(depthCounter);
      return;
    }
    node.children.forEach(child => this.getNodeDepths(child, depthsGatherer, depthCounter + 1));
  }

  private nameChildren(node: this = this, from = 0): void {
    node.children.forEach((child, i) => {
      child.path = this.createNodePath(i);
      this.nameChildren(child, 0);
    });
  }

  // on operation true, stop walking
  private walkOverChildren(needToStopFn: (n: this) => boolean, nodes: this[] = this.children): void {
    nodes.forEach(n => {
      if (needToStopFn(n)) {
        return;
      }
      this.walkOverChildren(needToStopFn, n.children);
    });
  }

  private createNodePath(index: number, node: this = this): number[] {
    return node.path.concat(index);
  }

  private comparePaths(pathOne: number[], pathTwo: number[]): boolean {
    if (pathOne.length !== pathTwo.length) {
      return false;
    }

    for (let i = 0; i < pathOne.length; i++) {
      if (pathOne[i] !== pathTwo[i]) {
        return false;
      }
    }
    return true;
  }

  private checkNodeChildren(node: this): boolean {
    // @ts-ignore
    node.children.forEach((child, i) => {
      if (!this.checkNode(node, i) || !this.checkNodeChildren(child)) {
        return false;
      }
    });
    return true;
  }

  private checkNode(parent: this, childIndex: number): boolean {
    const correctPath = this.createNodePath(childIndex, parent);
    const samePaths = this.comparePaths(parent.path, correctPath);

    if (!samePaths) {
      console.error(`INCORRECT PATH: ${parent.path[childIndex]}, SHOULD BE: ${correctPath}`);
    }
    return samePaths;
  }

  findNode(node: this): this | null {
    if (this.path.length === node.path.length) {
      return this;
    }

    if (this.path.length > node.path.length) {
      return null;
    }

    let children = this.children;
    for (let i = this.path.length; i < node.path.length - 1; i++) {
      children = children[node.path[i]].children;
    }
    return children[node.path[node.path.length - 1]];
  }
}
