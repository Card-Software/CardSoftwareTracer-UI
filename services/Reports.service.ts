import { ProductOrder } from '@/models/product-order';
import { TracerStreamExtended } from '@/models/tracer-stream';
import { TeamsProgressPercentage } from '@/models/reports/team-progress-percentage';
import { User } from '@/models/user';
import { orderManagementApiProxy } from '@/proxies/order-management.proxy';
import { PoSearchFilters } from '@/models/po-search-filter';

class ReportsService {
  readonly teams = ['Planning', 'SAC', 'NT'];

  getProgressPercentagesAllTeams(
    tracerStream: TracerStreamExtended,
  ): TeamsProgressPercentage {
    const planningSections = tracerStream.sections.filter((section) =>
      section.teamLabels.some((tl) => tl.labelName === this.teams[0]),
    );

    const completedPlanningSections = planningSections.filter((section) => {
      return section.isRequired && section.files.length > 0;
    });

    const sacSections = tracerStream.sections.filter((section) =>
      section.teamLabels.some((tl) => tl.labelName === this.teams[1]),
    );

    const completedSacSections = sacSections.filter((section) => {
      return section.isRequired && section.files.length > 0;
    });

    const ntSections = tracerStream.sections.filter((section) =>
      section.teamLabels.some((tl) => tl.labelName === this.teams[2]),
    );

    const completedNtSections = ntSections.filter((section) => {
      return section.isRequired && section.files.length > 0;
    });

    const progressPercentages: TeamsProgressPercentage = {
      planning:
        planningSections.length > 0
          ? (completedPlanningSections.length / planningSections.length) * 100
          : 0,
      sac:
        sacSections.length > 0
          ? (completedSacSections.length / sacSections.length) * 100
          : 0,
      nt:
        ntSections.length > 0
          ? (completedNtSections.length / ntSections.length) * 100
          : 0,
    };

    // round up
    progressPercentages.planning = Math.round(progressPercentages.planning);
    progressPercentages.sac = Math.round(progressPercentages.sac);
    progressPercentages.nt = Math.round(progressPercentages.nt);

    return progressPercentages;
  }

  tracerStreamProgressPercentage(tracerStream: TracerStreamExtended): number {
    const completedSectionsNumber = tracerStream.sections.filter(
      (section) => section.files.length > 0,
    ).length;

    return (completedSectionsNumber / tracerStream.sections.length) * 100;
  }
}

export const reportsService = new ReportsService();
