import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("staging")
export class Staging {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  cpu: string;

  @Column({ nullable: true })
  speed_cpu: string;

  @Column({ nullable: true })
  gpu: string;

  @Column({ nullable: true })
  ram: string;

  @Column({ nullable: true })
  storage: string;

  @Column({ nullable: true })
  free_storage: string;

  @Column({ nullable: true })
  contacts: string;

  @Column({ nullable: true })
  back_cam_resolution: string;

  @Column({ nullable: true })
  back_cam_movie: string;

  @Column({ nullable: true })
  back_cam_flash: string;

  @Column({ nullable: true })
  back_cam_features: string;

  @Column({ nullable: true })
  front_cam_resolution: string;

  @Column({ nullable: true })
  front_cam_features: string;

  @Column({ nullable: true })
  screen_technology: string;

  @Column({ nullable: true })
  screen_resolution: string;

  @Column({ nullable: true })
  screen_size: string;

  @Column({ nullable: true })
  max_brighness: string;

  @Column({ nullable: true })
  tempered_glass: string;

  @Column({ nullable: true })
  battery_size: string;

  @Column({ nullable: true })
  battery_type: string;

  @Column({ nullable: true })
  max_chagre: string;

  @Column({ nullable: true })
  battery_technology: string;

  @Column({ nullable: true })
  securtity: string;

  @Column({ nullable: true })
  special_feature: string;

  @Column({ nullable: true })
  water_resistant: string;

  @Column({ nullable: true })
  record: string;

  @Column({ nullable: true })
  movie: string;

  @Column({ nullable: true })
  music: string;

  @Column({ nullable: true })
  network_mobile: string;

  @Column({ nullable: true })
  sim: string;

  @Column({ nullable: true })
  wifi: string;

  @Column({ nullable: true })
  gps: string;

  @Column({ nullable: true })
  bluetooth: string;

  @Column({ nullable: true })
  port_charge: string;

  @Column({ nullable: true })
  headset_type: string;

  @Column({ nullable: true })
  other_connection: string;

  @Column({ nullable: true })
  design: string;

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  dimension_weight: string;

  @Column({ nullable: true })
  date_created: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  name: string

  @Column({ nullable: true })
  pricing: string
}