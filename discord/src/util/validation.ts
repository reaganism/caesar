/* Copyright (C) 2024  Tomat et al.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later versions.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses>.
 */

/**
 * Asserts that the given value is not null or undefined. Throws as error if it
 * is.
 * @param value The value to assert.
 * @returns The value if it is not null or undefined.
 */
export function assertNotNull<T>(value: T | null | undefined): T {
    if (value === null || value === undefined) {
        throw new Error("Assertion failed: value is null or undefined");
    }

    return value;
}
