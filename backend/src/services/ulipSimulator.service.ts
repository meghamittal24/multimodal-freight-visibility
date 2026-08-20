export class UlipSimulatorService {
  public static getFoisRakeFeed() {
    return [
      {
        rake_id: 'RAKE-WDFC-9021',
        rake_type: 'BCNHL Container High-Speed Double Stack',
        current_station: 'Palanpur Junction (PNU)',
        division: 'Ahmedabad (ADI)',
        speed_kmh: 74.5,
        loco_number: 'WAG-9HC-33104',
        gross_weight_tons: 3450.0,
        consignment_ids: ['shp-101'],
        fois_status: 'RUNNING_ON_TIME',
        signal_dwell_minutes: 8,
        last_updated: new Date().toISOString(),
      },
      {
        rake_id: 'RAKE-EDFC-4412',
        rake_type: 'BOXNHL Open Coal & Steel Rake',
        current_station: 'Kanpur Central Yard',
        division: 'Prayagraj (PRYJ)',
        speed_kmh: 58.0,
        loco_number: 'WAG-12B-60021',
        gross_weight_tons: 4100.0,
        consignment_ids: ['shp-103'],
        fois_status: 'YARD_SHUNTING',
        signal_dwell_minutes: 32,
        last_updated: new Date().toISOString(),
      },
    ];
  }

  public static getFastagTollFeed() {
    return [
      {
        tag_id: '34161FA820328901238',
        vehicle_reg: 'PB-10-CZ-8812',
        toll_plaza: 'Shambhu Barrier Toll (NH44)',
        state: 'Punjab / Haryana Border',
        timestamp: '2026-08-19T07:22:15.000Z',
        lane_type: 'FASTag Express Dedicated Lane 4',
        fee_debited_inr: 285.0,
        transit_status: 'NORMAL',
        congested_flag: false,
      },
      {
        tag_id: '34161FA899214488120',
        vehicle_reg: 'HR-55-AB-4491',
        toll_plaza: 'Shahjahanpur Toll Plaza (NH48)',
        state: 'Rajasthan Border',
        timestamp: new Date().toISOString(),
        lane_type: 'FASTag Lane 02',
        fee_debited_inr: 460.0,
        transit_status: 'HIGH_QUEUE_BOTTLENECK',
        avg_wait_minutes: 48,
        congested_flag: true,
      },
    ];
  }

  public static getPcs1xPortFeed() {
    return [
      {
        port_code: 'INMUN',
        port_name: 'Mundra Port (APSEZ Container Terminal 2)',
        vessel_name: 'MV Ocean Giant',
        imo_number: 'IMO-9482101',
        berth_assigned: 'Berth MICT-2',
        eta_scheduled: '2026-08-20T18:00:00.000Z',
        eta_revised: '2026-08-21T03:30:00.000Z',
        delay_hours: 9.5,
        berth_queue_count: 5,
        crane_productivity_gcr: 28.4,
        pcs_status: 'BERTH_CONGESTION_HOLD',
        last_pilot_ping: new Date().toISOString(),
      },
      {
        port_code: 'INNSA',
        port_name: 'JNPT Nhava Sheva Gateway Terminal',
        vessel_name: 'MV Bharat Pioneer',
        imo_number: 'IMO-9331024',
        berth_assigned: 'Berth NSIGT-01',
        eta_scheduled: '2026-08-20T22:00:00.000Z',
        eta_revised: '2026-08-20T22:15:00.000Z',
        delay_hours: 0.25,
        berth_queue_count: 1,
        crane_productivity_gcr: 32.1,
        pcs_status: 'CLEAR_TO_BERTH',
        last_pilot_ping: new Date().toISOString(),
      },
    ];
  }
}
