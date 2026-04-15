import { Component, OnInit } from '@angular/core';
import { SystemConfigService } from '../../core/services/system-config.service';
import { AuthService } from '../../core/services/auth.service';
import { SystemConfigDTO } from '../../core/models/system-config.model';

interface ConfigGroup {
  label: string;
  icon: string;
  keys: string[];
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  configs: SystemConfigDTO[] = [];
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';
  editingKey: string | null = null;
  editValue = '';

  isAdmin = false;

  configGroups: ConfigGroup[] = [
    { label: 'Billing & Tax', icon: 'fas fa-calculator', keys: ['tax_rate', 'currency_default', 'invoice_prefix'] },
    { label: 'Scheduler', icon: 'fas fa-clock', keys: ['scheduler_cron'] },
    { label: 'Dunning', icon: 'fas fa-bell', keys: ['dunning_day_1', 'dunning_day_2', 'dunning_day_3'] },
    { label: 'Security', icon: 'fas fa-shield-alt', keys: ['session_timeout_minutes', 'password_min_length'] },
    { label: 'Other', icon: 'fas fa-sliders-h', keys: ['customer_code_prefix'] }
  ];

  constructor(
    private configService: SystemConfigService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.loading = true;
    this.configService.getAllConfigs().subscribe({
      next: (data) => {
        this.configs = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load system configurations';
        this.loading = false;
      }
    });
  }

  getConfigsForGroup(group: ConfigGroup): SystemConfigDTO[] {
    return this.configs.filter(c => group.keys.includes(c.configKey));
  }

  getUngroupedConfigs(): SystemConfigDTO[] {
    const allGroupedKeys = this.configGroups.flatMap(g => g.keys);
    return this.configs.filter(c => !allGroupedKeys.includes(c.configKey));
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  startEdit(config: SystemConfigDTO): void {
    this.editingKey = config.configKey;
    this.editValue = config.configValue;
  }

  cancelEdit(): void {
    this.editingKey = null;
    this.editValue = '';
  }

  saveConfig(config: SystemConfigDTO): void {
    if (!this.editValue.trim()) return;

    this.saving = true;
    const updated = { ...config, configValue: this.editValue.trim() };

    this.configService.updateConfig(config.configKey, updated).subscribe({
      next: (saved) => {
        const idx = this.configs.findIndex(c => c.configKey === saved.configKey);
        if (idx > -1) this.configs[idx] = saved;
        this.editingKey = null;
        this.editValue = '';
        this.saving = false;
        this.successMessage = `${this.formatKey(saved.configKey)} updated successfully`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Failed to update configuration';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
