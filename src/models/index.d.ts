import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type AttendanceBookMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerAttendanceBook = {
  readonly id: string;
  readonly time: string;
  readonly membership_number: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyAttendanceBook = {
  readonly id: string;
  readonly time: string;
  readonly membership_number: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type AttendanceBook = LazyLoading extends LazyLoadingDisabled ? EagerAttendanceBook : LazyAttendanceBook

export declare const AttendanceBook: (new (init: ModelInit<AttendanceBook, AttendanceBookMetaData>) => AttendanceBook) & {
  copyOf(source: AttendanceBook, mutator: (draft: MutableModel<AttendanceBook, AttendanceBookMetaData>) => MutableModel<AttendanceBook, AttendanceBookMetaData> | void): AttendanceBook;
}