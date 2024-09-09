import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
	Box,
	Button,
	Container,
	Flex,
	Grid,
	Heading,
	SegmentedControl,
	Text,
} from "@radix-ui/themes";
import {
	addDays,
	addMonths,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	startOfMonth,
	startOfWeek,
	subMonths,
	toDate as toGregorian,
} from "date-fns";
import {
	addMonths as addJalaliMonths,
	endOfMonth as endOfJalaliMonth,
	endOfWeek as endOfJalaliWeek,
	format as formatJalali,
	startOfMonth as startOfJalaliMonth,
	startOfWeek as startOfJalaliWeek,
	toDate as toJalali,
} from "date-fns-jalali";
import React, { useState } from "react";

const GREGORIAN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const JALALI_DAYS = [
	"شنبه",
	"یکشنبه",
	"دوشنبه",
	"سه‌شنبه",
	"چهارشنبه",
	"پنج‌شنبه",
	"جمعه",
];
const FARSI_NUMERALS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const CELL_BORDER_RADIUS = "12px";

function convertToFarsiNumerals(persianDate: string): React.ReactNode {
	return persianDate.split("").map((char, index) => {
		const digit = Number.parseInt(char, 10);
		return Number.isNaN(digit) ? (
			char
		) : (
			<React.Fragment key={`farsi-numeral-${index}-${digit}`}>
				{FARSI_NUMERALS[digit]}
			</React.Fragment>
		);
	});
}

const DualCalendar: React.FC = () => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [isJalaliPrimary, setIsJalaliPrimary] = useState(false);

	const getCalendarDates = (date: Date, isJalali: boolean) => {
		if (isJalali) {
			const jalaliDate = toJalali(date);
			const monthStart = startOfJalaliMonth(jalaliDate);
			const monthEnd = endOfJalaliMonth(monthStart);
			const startDate = startOfJalaliWeek(monthStart);
			const endDate = endOfJalaliWeek(monthEnd);
			return { monthStart, monthEnd, startDate, endDate };
		}
		const monthStart = startOfMonth(date);
		const monthEnd = endOfMonth(monthStart);
		const startDate = startOfWeek(monthStart);
		const endDate = endOfWeek(monthEnd);
		return { monthStart, monthEnd, startDate, endDate };
	};

	const { monthStart, startDate, endDate } = getCalendarDates(
		currentDate,
		isJalaliPrimary,
	);

	const onDateClick = (day: Date) => {
		setCurrentDate(day);
	};

	const nextMonth = () => {
		setCurrentDate(
			isJalaliPrimary
				? toGregorian(addJalaliMonths(toJalali(currentDate), 1))
				: addMonths(currentDate, 1),
		);
	};

	const currentMonth = () =>
		setCurrentDate(
			isJalaliPrimary
				? toGregorian(toJalali(new Date()))
				: toJalali(new Date()),
		);

	const prevMonth = () => {
		setCurrentDate(
			isJalaliPrimary
				? toGregorian(addJalaliMonths(toJalali(currentDate), -1))
				: subMonths(currentDate, 1),
		);
	};

	const toggleCalendar = () => {
		setIsJalaliPrimary(!isJalaliPrimary);
	};

	const renderHeader = () => {
		const dateFormat = "MMMM yyyy";
		const gregorianDate = format(currentDate, dateFormat);
		const jalaliDate = formatJalali(currentDate, dateFormat);

		return (
			<Flex direction="column" align="center" mb="4">
				<Box mb="4">
					<SegmentedControl.Root
						variant="classic"
						defaultValue="gregorian"
						value={isJalaliPrimary ? "jalali" : "gregorian"}
						onValueChange={toggleCalendar}
					>
						<SegmentedControl.Item value="gregorian">
							Gregorian
						</SegmentedControl.Item>
						<SegmentedControl.Item value="jalali">Jalali</SegmentedControl.Item>
					</SegmentedControl.Root>
				</Box>
				<Flex justify="between" width="100%" mb="2">
					<Button variant="soft" onClick={prevMonth}>
						<ChevronLeftIcon />
					</Button>
					<Button variant="ghost" onClick={currentMonth}>
						<Flex direction="column" align="center">
							<Heading size="4">
								{isJalaliPrimary ? jalaliDate : gregorianDate}
							</Heading>
							<Text size="2" color="gray">
								{isJalaliPrimary ? gregorianDate : jalaliDate}
							</Text>
						</Flex>
					</Button>
					<Button variant="soft" onClick={nextMonth}>
						<ChevronRightIcon />
					</Button>
				</Flex>
			</Flex>
		);
	};

	const renderDays = () => {
		const days = isJalaliPrimary ? JALALI_DAYS : GREGORIAN_DAYS;
		return (
			<Grid columns="7" mb="2">
				{days.map((day) => (
					<Flex key={day} direction="column" align="center">
						<Text size="1" weight="bold">
							{day}
						</Text>
					</Flex>
				))}
			</Grid>
		);
	};

	const renderCells = () => {
		const dateFormat = "d";
		const rows = [];
		let days = [];
		let day = startDate;
		let rowIndex = 0;

		while (day <= endDate) {
			for (let i = 0; i < 7; i++) {
				const cloneDay = day;
				const formattedDate = isJalaliPrimary
					? formatJalali(cloneDay, dateFormat)
					: format(cloneDay, dateFormat);
				const secondaryDate = isJalaliPrimary
					? format(cloneDay, dateFormat)
					: formatJalali(cloneDay, dateFormat);

				const isCurrentMonth = isJalaliPrimary
					? formatJalali(cloneDay, "MM") === formatJalali(monthStart, "MM")
					: isSameMonth(cloneDay, monthStart);

				const isFirstDay = rowIndex === 0 && i === 0;
				const isLastDay =
					day > endDate ||
					(rowIndex > 3 &&
						i === 6 &&
						!isSameMonth(addDays(day, 1), monthStart));
				const isFirstDayOfLastRow =
					i === 0 &&
					(rowIndex === 5 ||
						(rowIndex === 4 && !isSameMonth(addDays(day, 7), monthStart)));
				const isLastDayOfFirstRow = rowIndex === 0 && i === 6;

				days.push(
					<Flex
						position="relative"
						key={cloneDay.toString()}
						direction="column"
						justify={{
							initial: "center",
							sm: "between",
						}}
						align={{
							initial: "center",
							sm: "start",
						}}
						p="2"
						height={{
							initial: "3rem",
							sm: "6rem",
						}}
						style={{
							border: "1px solid var(--gray-5)",
							borderTopLeftRadius: isFirstDay ? CELL_BORDER_RADIUS : "0",
							borderBottomLeftRadius: isFirstDayOfLastRow
								? CELL_BORDER_RADIUS
								: "0",
							borderTopRightRadius: isLastDayOfFirstRow
								? CELL_BORDER_RADIUS
								: "0",
							borderBottomRightRadius: isLastDay ? CELL_BORDER_RADIUS : "0",
							backgroundColor: isCurrentMonth
								? isSameDay(cloneDay, new Date())
									? "var(--blue-3)"
									: "transparent"
								: "var(--gray-2)",
							cursor: "pointer",
						}}
						onClick={() => onDateClick(cloneDay)}
					>
						<Text size="2" weight={isCurrentMonth ? "regular" : "light"}>
							{isJalaliPrimary
								? convertToFarsiNumerals(formattedDate)
								: formattedDate}
						</Text>
						<Text size="1" color="gray">
							{isJalaliPrimary
								? secondaryDate
								: convertToFarsiNumerals(secondaryDate)}
						</Text>
						{(
							isJalaliPrimary
								? Number(formattedDate) === 1
								: cloneDay.getDate() === 1
						) ? (
							<Box
								position="absolute"
								top="0"
								right="2"
								display={{
									initial: "none",
									sm: "block",
								}}
							>
								<Text size="1" weight="bold" color="blue">
									{isJalaliPrimary
										? formatJalali(cloneDay, "MMM")
										: format(cloneDay, "MMM")}
								</Text>
							</Box>
						) : null}
					</Flex>,
				);
				day = isJalaliPrimary
					? toGregorian(addDays(toJalali(cloneDay), 1))
					: addDays(cloneDay, 1);
			}
			rows.push(
				<Grid key={day.toString()} columns="7">
					{days}
				</Grid>,
			);
			days = [];
			rowIndex++;
		}
		return <Grid mt="2">{rows}</Grid>;
	};

	return (
		<Flex direction="column" justify="center" height="100vh" p="4">
			<Container size="4">
				{renderHeader()}
				{renderDays()}
				{renderCells()}
			</Container>
		</Flex>
	);
};

export default DualCalendar;
