import { Injectable } from '@nestjs/common';

@Injectable()
export class FieldTypeService {
  private types = new Map<string, any>();

  register(name: string, config: any) {
    this.types.set(name, config);
  }

  get(name: string) {
    return this.types.get(name);
  }

  list() {
    return Array.from(this.types.keys());
  }

  getDefaults() {
    return ['text', 'textarea', 'number', 'select', 'date', 'datetime', 'file', 'switch', 'radio', 'checkbox'];
  }
}
